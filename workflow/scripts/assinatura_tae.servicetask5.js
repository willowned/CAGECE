var DEFAULT_INDEX = 0
var INITIAL_VALUE = 1
var FILE_DIR = []
var ASSINATURA = []
var ANEXOS = []
// var TOKEN = getToken()

function servicetask5(attempt, message) {
    // Antes de mais nada, testa se o usuário logado possui permissão para enviar arquivos ao TAE - tela de parametros
    // var USUARIO_LOGADO_TEM_PERMISSAO = getPermissaoUsuario()

    // Ok, registro encontrado para o usuário logado...
    // if(USUARIO_LOGADO_TEM_PERMISSAO) { 
	//     // Testa se foi anexado algum arquivo...
	// 	var FILES = getFiles()

	//     if(!FILES.SIZE) {
	//     	throw " \n\n <b>Atenção</b>: anexe ao menos um arquivo no formato PDF para prosseguir. \n\n"
	//     }
	// 	else {
	//     	// Para cada arquivo, realiza o Upload e Adiciona os destinatários...
	// 		handlerFiles(FILES.ALL_FILES)
	//     }
    // }
	// else throw " \n\n <b>Atenção</b>: seu usuário não possui permissão para enviar arquivos ao Totvs Assinatura Eletrônica. \n Verifique a tela de parâmetros do TAE, aba usuários. \n\n"

	// Testa se foi anexado algum arquivo...
	var FILES = getFiles()

	if(!FILES.SIZE) {
		throw " \n\n <b>Atenção</b>: anexe ao menos um arquivo no formato PDF para prosseguir. \n\n"
	}
	else {
		// Para cada arquivo, realiza o Upload e Adiciona os destinatários...
		handlerFiles(FILES.ALL_FILES)
	}
}

function getFiles() {
	var FILES = hAPI.listAttachments()

	return {SIZE: FILES.size(), ALL_FILES: FILES}
}

// function getPermissaoUsuario() {
//     var COD_USUARIO_LOGADO = getValue("WKUser")
	
// 	var C1 = DatasetFactory.createConstraint("userFluig", COD_USUARIO_LOGADO, COD_USUARIO_LOGADO, ConstraintType.MUST)
//     var DS_GET_USUARIOS_TAE = DatasetFactory.getDataset("ds_getUsuariosTAE", null, [C1], null).rowsCount
    
//     return DS_GET_USUARIOS_TAE
// }

function handlerFiles(FILES) {
	for(var i = DEFAULT_INDEX; i < FILES.size(); i++) {
		var FILE = FILES.get(i)
		mergeFiles(FILE)
	}
				
	// Chamando dataset responsável pelo Upload do arquivo
	uploadFiles(ASSINATURA)
}

function uploadFiles(DIR_ARQUIVO) {
	var TOKEN = getToken()
	var NOME_ENVELOPE = hAPI.getCardValue("nomeEnvelope")
	var ENDPOINT = hAPI.getCardValue("endpoint")

	var DS_PORTA_ARQUIVO_TAE = DatasetFactory.getDataset("dsTAEUploadArquivo", [JSON.stringify(DIR_ARQUIVO), String(TOKEN), String(NOME_ENVELOPE), String(ENDPOINT)], null, null)

	if(DS_PORTA_ARQUIVO_TAE.rowsCount) {
		var RESPONSE = DS_PORTA_ARQUIVO_TAE.getValue(DEFAULT_INDEX, "detalhes")
		var REPONSE_PARSED = JSON.parse(RESPONSE)
		var SUCCEEDED = REPONSE_PARSED.success
		var DOC_ID = REPONSE_PARSED.data

		if(SUCCEEDED) {
			hAPI.setCardValue("idDoc", DOC_ID)
			
			// Publica os anexos envelope
			uploadAnexos(DOC_ID)

			// Montando envelope para assinatura(s)...
			getParamsIntegracao(DOC_ID)
		}
	}
	else throw " \n\n <b>Atenção</b>: erro ao carregar o dsTAEUploadArquivo - retorno vazio. Contate o administrador da plataforma. \n\n"
}

function uploadAnexos(DOC_ID) {
	var TOKEN = getToken()
	var ENDPOINT = hAPI.getCardValue("endpoint")

	var DS_POST_ANEXO_TAE = DatasetFactory.getDataset("dsTAEUploadAnexo", [JSON.stringify(ANEXOS), String(DOC_ID), String(TOKEN), String(ENDPOINT)], null, null)
}

function getFileDir(FILE) {
	// var defaultDirectory = fluigAPI.getTenantService().getTenantData(["dirDefault"]).get("dirDefault")

    return (
        // defaultDirectory + "/public/" +
        FILE.getDocumentId() + "/" +
        FILE.getVersion() + "/" +
        FILE.getPhisicalFile()
    )
}

function getParamsIntegracao(DOC_ID) {
	var CONSTRAINTS = []
	var ASSINAR_ENVIAR = hAPI.getCardValue("assinarEnviar") == "on"
	var UTILIZA_ORDEM_ASSINATURA = hAPI.getCardValue("utilizaOrdemAss") == "on"
	var RESP_ASS_DOCUMENT = ASSINAR_ENVIAR
	var ASSINATURA_MANUSCRITA = hAPI.getCardValue("assinaManus") == "on"
	var PERMITE_REJEITAR_DOCUMENTO = hAPI.getCardValue("rejeitarDocumento") == "on"
	var DATA_EXPIRACAO = hAPI.getCardValue("dataExpiracao")
	var ASSUNTO_MENSAGEM = hAPI.getCardValue("assunto")
	var CORPO_MENSAGEM = hAPI.getCardValue("mensagem")

	// Destinatário e Observadores
	var PARAMS = getDestinatarios()
	var DESTINATARIOS = JSON.stringify(PARAMS.DESTINATARIOS)
	var OBSERVADORES = JSON.stringify(PARAMS.OBSERVADORES)

	// Responsável
	var RESPONSAVEL = JSON.stringify(getJSONResponsavel())
	var ASSINATURA_RESPONSAVEL = ASSINAR_ENVIAR ? RESPONSAVEL : null

	var TOKEN = getToken()

	// Constraints
	var C10 = DatasetFactory.createConstraint("idDocumento", DOC_ID, null, ConstraintType.MUST)
	var C20 = DatasetFactory.createConstraint("destinatarios", DESTINATARIOS, null, ConstraintType.MUST)
	var C30 = DatasetFactory.createConstraint("observadores", OBSERVADORES, null, ConstraintType.MUST)
	var C40 = DatasetFactory.createConstraint("utilizaworkflow", UTILIZA_ORDEM_ASSINATURA, null, ConstraintType.MUST)
	var C50 = DatasetFactory.createConstraint("respAssDocument", RESP_ASS_DOCUMENT, null, ConstraintType.MUST)
	var C60 = DatasetFactory.createConstraint("dataExpiracao", DATA_EXPIRACAO, null, ConstraintType.MUST)
	var C70 = DatasetFactory.createConstraint("assuntoMensagem", ASSUNTO_MENSAGEM, null, ConstraintType.MUST)
	var C80 = DatasetFactory.createConstraint("corpoMensagem", CORPO_MENSAGEM, null, ConstraintType.MUST)
	var C90 = DatasetFactory.createConstraint("assManuscrita", ASSINATURA_MANUSCRITA, null, ConstraintType.MUST)
	var C100 = DatasetFactory.createConstraint("assinaturaResponsavel", ASSINATURA_RESPONSAVEL, null, ConstraintType.MUST)
	var C110 = DatasetFactory.createConstraint("rejeitarDocumento", PERMITE_REJEITAR_DOCUMENTO, null, ConstraintType.MUST)
	var C120 = DatasetFactory.createConstraint("token", TOKEN, null, ConstraintType.MUST)
	var C130 = DatasetFactory.createConstraint("lembrete", String(0), null, ConstraintType.MUST)

	CONSTRAINTS.push(C10, C20, C30, C40, C50, C60, C70, C80, C90, C100, C110, C120, C130)

	publicarTAE(CONSTRAINTS)
}

function getJSONResponsavel() {
	var DOC_ID = parseInt(hAPI.getCardValue("idDoc"))
	var TIPO_ASSINATURA = parseInt(hAPI.getCardValue("tipoDeAssinatura"))

	return {idDocumento: DOC_ID, tipoDeAssinatura: TIPO_ASSINATURA}
}

function publicarTAE(CONSTRAINTS) {
	var DS_POST_PUBLICACAO_TAE = DatasetFactory.getDataset("dsTAECriarEnvelope", null, CONSTRAINTS, null)

	if(DS_POST_PUBLICACAO_TAE.rowsCount) {
		var SUCCESS = DS_POST_PUBLICACAO_TAE.getValue(DEFAULT_INDEX, "success")
		var COND = SUCCESS == "false" || SUCCESS == false

		if(COND) {
			var MESSAGE = DS_POST_PUBLICACAO_TAE.getValue(DEFAULT_INDEX, "message")
			throw " \n\n <b>Atenção</b>: "+MESSAGE+"\n\n"
		}
	}
	else throw " \n\n <b>Atenção</b>: erro ao carregar o dsTAECriarEnvelope - retorno vazio. Contate o administrador da plataforma. \n\n"
}

function getDestinatarios() {
	var INDEXES = hAPI.getChildrenIndexes("tbCtts")
	var ORDEM_ASSINATURA = hAPI.getCardValue("utilizaOrdemAss")
	var DESTINATARIOS = []
	var OBSERVADORES = []
	var INITIAL_VALUE = 1
	var CODIGO_TIPO_AUTENTICACAO = 2
	var CODIGO_OBSERVADOR = 3
	var CODIGOS_TIPO_ID = [1, 2]

	INDEXES.forEach(function(INDEX) {
		var OBJECT = {}	
		var EMAIL = hAPI.getCardValue("emailCtt___" + INDEX)
		var ACAO = parseInt(hAPI.getCardValue("tipoAss___" + INDEX))
		var WORKFLOW = parseInt(hAPI.getCardValue("ordemAss___" + INDEX))
		var PAPEL_ASSINANTE = hAPI.getCardValue("papelAssinante___" + INDEX)
		var TIPO_AUTENTICACAO = parseInt(hAPI.getCardValue("tipoAuth___" + INDEX))
		var NOME_COMPLETO = hAPI.getCardValue("nomeCompleto___" + INDEX)
		var TIPO_ID = parseInt(hAPI.getCardValue("tipoIdentificacao___" + INDEX))
		var IDENTIFICACAO = hAPI.getCardValue("documentoIdentificacao___" + INDEX)

		var IS_DESTINATARIO = ACAO != CODIGO_OBSERVADOR
		var IS_ENVIO_CODIGO_POR_EMAIL = TIPO_AUTENTICACAO == CODIGO_TIPO_AUTENTICACAO
		var REQUIRE_ID = TIPO_ID == CODIGOS_TIPO_ID[DEFAULT_INDEX] || TIPO_ID == CODIGOS_TIPO_ID[INITIAL_VALUE]
		var UTILIZA_ORDEM_ASSINATURA = ORDEM_ASSINATURA != "on"

		UTILIZA_ORDEM_ASSINATURA ? WORKFLOW = DEFAULT_INDEX : WORKFLOW

		if(IS_DESTINATARIO) {
			OBJECT.email = String(EMAIL),
			OBJECT.acao = ACAO,
			OBJECT.tipoAutenticacao = TIPO_AUTENTICACAO,
			OBJECT.workflow = WORKFLOW,
			OBJECT.papelAssinante = String(PAPEL_ASSINANTE)
	
			if(IS_ENVIO_CODIGO_POR_EMAIL) {
				OBJECT.nomeCompleto = String(NOME_COMPLETO),
				OBJECT.tipoIdentificacao = TIPO_ID
	
				if(REQUIRE_ID) OBJECT.identificacao = String(IDENTIFICACAO)
			}
	
			DESTINATARIOS.push(OBJECT)
		}
		else OBSERVADORES.push({email: String(EMAIL)})
	})
  
	return {DESTINATARIOS: DESTINATARIOS, OBSERVADORES: OBSERVADORES}
}

function mergeFiles(FILE) {
	var INDEXES = hAPI.getChildrenIndexes("documentos")

	INDEXES.forEach(function(INDEX) {
		var FILE_NAME = String(hAPI.getCardValue("documento___" + INDEX))
		var ACAO = parseInt(hAPI.getCardValue("acoesDocumento___" + INDEX))
		var EXTENSAO = getFileExtension(FILE_NAME)
		var APPLICATION = getFileApplication(EXTENSAO)
		var NAME = FILE_NAME == FILE.getPhisicalFile()
		var DOCUMENT_ID = FILE.getDocumentId()

		if(NAME) {
			switch(ACAO) {
				case 1:
					ASSINATURA.push({dir: String(getFileDir(FILE)).trim(),application: APPLICATION.trim(), documentId: parseInt(DOCUMENT_ID), fileName: FILE_NAME.trim()})
					break
	
				case 2:
					ANEXOS.push({dir: String(getFileDir(FILE)).trim(), application: "application/octet-stream", documentId: parseInt(DOCUMENT_ID), fileName: FILE_NAME.trim()})
					break	
			}
		}
	})
}

function getFileExtension(FILE) {
	return FILE.split(".")[INITIAL_VALUE]
}

function getFileApplication(FILE_EXTENSION) {
	switch(FILE_EXTENSION) {
		case "pdf":
			return "application/pdf"

		case "docx":
			return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"	

		case "doc":
			return "application/msword"
	}
}

function getToken() {
	var refresh = String(hAPI.getCardValue("refreshToken"))
    var DATASET = DatasetFactory.getDataset("dsTAERefreshToken", [JSON.stringify({ refreshToken: refresh })], null, null)

    if(DATASET.rowsCount) {
		var succeeded = DATASET.getValue(0, "succeeded")
		var token = DATASET.getValue(0, "token")
		var refreshToken = DATASET.getValue(0, "refreshToken")

		if(succeeded) {
			hAPI.setCardValue("token", token)
			hAPI.setCardValue("refreshToken", refreshToken)

			return token
		}
    }
}

// function getToken() {
//     var DATASET_CREDENCIAIS = DatasetFactory.getDataset("dsTAEParametros", null, null, null)
    
//     var usuarioTAE = DATASET_CREDENCIAIS.getValue(0, "usuarioTAE")
//     var senhaTAE = DATASET_CREDENCIAIS.getValue(0, "senhaTAE")
    
//     var DATASET_LOGIN = DatasetFactory.getDataset("dsTAELogin", [usuarioTAE, senhaTAE], null, null)
//     var token = DATASET_LOGIN.getValue(0, "token")
    
//     return token
// }

// function getToken() {
// 	return hAPI.getCardValue("token")
// }