var logStep = 0;
function servicetask6(attempt, message) {
    /*** Consulta Assinatura (TAE) ***/
    // setLog("info", "start", "");
   
	// Atualiza status do prazo de aceite
	// hAPI.setCardValue("prazoExcedido", getPrazoAceite())

    //atualiza contador
    var numeroConsultas = parseInt(hAPI.getCardValue("numeroConsultas")) || 0
    // setLog("info", "numeroConsultas", numeroConsultas)

    hAPI.setCardValue("numeroConsultas", numeroConsultas+1)
    // setLog("info", "numeroConsultas soma", numeroConsultas + 1)

        var retorno = false;
        var constraints = new Array();
        var sortingFields = new Array();

        constraints.push(DatasetFactory.createConstraint("id", hAPI.getCardValue("idDoc"), hAPI.getCardValue("idDoc"), ConstraintType.MUST));
        constraints.push(DatasetFactory.createConstraint("token", String(getToken()), String(getToken()), ConstraintType.MUST));

        // setLog("info", "constraints", "")
   
        var dataset = DatasetFactory.getDataset("dsTAEConsultarEnvelope", null, constraints, sortingFields);

        // setLog("info", "dataset dsTAEConsultarEnvelope", "")

        if ( dataset.rowsCount > 0 ) {
     
            var success = dataset.getValue(0, "success");
            var messageDs = dataset.getValue(0, "message");
            var codigoStatus = ""

            // setLog("info", "success", success)
            // setLog("info", "message", messageDs)
  
            var resultadoAssinatura = "";

            if (success == true) {

                // setLog("info", "success true", "")
                codigoStatus = dataset.getValue(0, "status");
                // setLog("info", "codigoStatus", codigoStatus)

                var objetoRetornado = JSON.parse(dataset.getValue(0, "objeto"));

                // setLog("info", "objetoRetornado", "")

                //publicacaoOpcoes
                hAPI.setCardValue("nomeArquivo", objetoRetornado.data.nomeArquivo || "")
                hAPI.setCardValue("dataPublicacao", formatDate(objetoRetornado.data.recCreatedOn) || "")
                hAPI.setCardValue("recModifiedOn", formatDate(objetoRetornado.data.recModifiedOn) || "")
                hAPI.setCardValue("dataExpiracao", formatDate2(objetoRetornado.data.publicacaoOpcoes.dataExpiracao))
                hAPI.setCardValue("mensagem", objetoRetornado.data.publicacaoOpcoes.corpoMensagem || "")
                hAPI.setCardValue("assunto", objetoRetornado.data.publicacaoOpcoes.assuntoMensagem || "")
                
                if (codigoStatus == 0) {
                    resultadoAssinatura = "Pendente"
                }

                if (codigoStatus == 1) {
                    resultadoAssinatura = "Parcialmente assinado"
                }

                if (codigoStatus == 2) {
                    resultadoAssinatura = "Finalizado"
                }

                if (codigoStatus == 3) {
                    resultadoAssinatura = "Todos"
                }

                if (codigoStatus == 4) {
                    resultadoAssinatura = "Rejeitado";
                    hAPI.setCardValue("motivoRejeicao", objetoRetornado.data.motivoRejeicao);             
                }

                if (codigoStatus == 5) {
                    resultadoAssinatura = "Rascunho"
                }

                if (codigoStatus == 6) {
                    resultadoAssinatura = "Pendente"
                }            
                // Adicionar PaixFilho de Atualizações...
                atualizaStatusAssinantes(objetoRetornado)
                
            } else {

                // setLog("info", "---------------------success false-------------------", "")
                // setLog("info", "message", messageDs)
                if (messageDs == "Documento não encontrado.") {

                    resultadoAssinatura = "Documento excluído"
                    codigoStatus = "99"

                } else {

                    retorno = false;
                    throw "Não foi possível consultar o status da assinatura. \n " + messageDs

                }
            }

            /* codigostatus
                   0 = Pendente
                   1 = Assinado Parcialmente
                   2 = Finalizado
                   3 = Todos ???
                   4 = Rejeitado
                   5 = Rascunho
                   6 = Pendente Comigo
            */

            hAPI.setCardValue("resultadoAssinatura", resultadoAssinatura)
            // setLog("info", "setCardValue resultadoAssinatura", resultadoAssinatura)

            hAPI.setCardValue("codStatusAssinatura", codigoStatus)
            // setLog("info", "setCardValue codigoStatus", codigoStatus)

            retorno = true;
        }
        
        return retorno;
}

function atualizaStatusAssinantes(data){

    // setLog("dir", "start atualizaStatusAssinantes", data)

    var indexes = hAPI.getChildrenIndexes("destinatariosTAE");
    
    // setLog("dir", "indexes", indexes)

    var idNovo = indexes.length + 1;

    // setLog("info", "idNovo", idNovo)
    
    var ASSINANTES = data.data.assinantes
    var ADICIONAR = true
    var EMAILS = []

    if(ASSINANTES.length) {
        var CHILD_DATA = new java.util.HashMap()

        for(var i = 0; i < ASSINANTES.length; i++) {
            var ASSINANTE = ASSINANTES[i]

            for(var j = 0; j < indexes.length; j++) {
                var ID = indexes[j]
                var EMAIL_DESTINATARIO = hAPI.getCardValue("dest_email_tae___" + ID)

                if(ASSINANTE.email == EMAIL_DESTINATARIO) {
                    ADICIONAR = false                    
                }
            }
            
            if(ADICIONAR) {
                CHILD_DATA.put("dest_email_tae", ASSINANTE.email)
                CHILD_DATA.put("dest_nome_tae", ASSINANTE.nome)
                CHILD_DATA.put("dest_data_tae", formatDate(ASSINANTE.data))
                CHILD_DATA.put("dest_statusTipoAssinatura_tae", fnTraduzStatus(ASSINANTE.statusTipoAssinatura))
                CHILD_DATA.put("dest_acao_tae", String(ASSINANTE.acao))
                CHILD_DATA.put("dest_pendente_tae", "Não")
    
                hAPI.addCardChild("destinatariosTAE", CHILD_DATA)
                EMAILS.push(ASSINANTE.email)
            }
        }
    }

    if (data.data.pendentes && data.data.pendentes.length > 0) {
        
        //percorre pendentes no TAE
        // setLog("info", "percorre pendentes no TAE", "")

        for (var i = 0; i < data.data.pendentes.length; i++) {
            
            var assinante = data.data.pendentes[i]

            // setLog("dir", "assinante" + i, assinante)
            
            var adicionarNaTabela = true;

            //percorre tabela formulario
            // setLog("info", "percorre tabela formulario", "")
            for (var j = 0; j < indexes.length; j++) {

                var id = indexes[j];
                var childData = new java.util.HashMap();

                emailDestinatario = hAPI.getCardValue("dest_email_tae___" + id);

                // setLog("info", "emailDestinatario " + id, emailDestinatario)

                if (assinante.email == emailDestinatario) {

                    // setLog("info", "encontrado assinante.email == emailDestinatario " + id, "")

                    adicionarNaTabela = false;

                    //Alterado 22/06 - assinante.pendente comecou a retorno = false

                    //hAPI.setCardValue("dest_pendente_tae___" + id, assinante.pendente + "")
                    hAPI.setCardValue("dest_pendente_tae___" + id,  "Sim")
                   
                    //Verificar Assinante

                
                }
            }

            if (adicionarNaTabela && EMAILS.indexOf(assinante.email) == -1){

                // setLog("info", "adicionarNaTabela ", idNovo)

                // setLog("info", "adicionarNaTabela assinante.email ", assinante.email)

                var childData = new java.util.HashMap();
                childData.put("dest_email_tae", assinante.email + "");
                childData.put("dest_acao_tae", assinante.acao + "");
                //childData.put("dest_pendente_tae", assinante.pendente + "");
                childData.put("dest_pendente_tae",  "Sim");

                hAPI.addCardChild("destinatariosTAE", childData);
            }
        }

        //percorre pendentes no TAE
        // setLog("info", "percorre assinantes no TAE", "")

        for (var i = 0; i < data.data.assinantes.length; i++) {

            var assinante = data.data.assinantes[i]

            for (var j = 0; j < indexes.length; j++) {

                var id = indexes[j];
                emailDestinatario = hAPI.getCardValue("dest_email_tae___" + id);

                if (assinante.email == emailDestinatario) {

                    hAPI.setCardValue("dest_nome_tae___" + id, assinante.nome)
                    hAPI.setCardValue("dest_data_tae___" + id, formatDate(assinante.data))
                    hAPI.setCardValue("dest_statusTipoAssinatura_tae___" + id, fnTraduzStatus(assinante.statusTipoAssinatura) + "")
                    hAPI.setCardValue("dest_pendente_tae___" + id, "Não")
                }
            }

        }
    } 
}

function setLog(tipo,titulo,conteudo){
    if(tipo == "info"){
        // log.info(conteudo)
    }
    if(tipo == "dir"){
        // log.dir(conteudo)
    }

    logStep++;
}

// Formata a data no formato DD/MM/YYYY HH:mm:ss
function formatDate(input) {	 
	 //Ex: 2022-12-05T17:27:35.146479
	 if(input != "" && input != '' && input != null && input != undefined){
		 var datePart = input.match(/\d+/g),
		 year = datePart[0], // get only two digits
		 month = datePart[1],
		 day = datePart[2];	
		 var hora = parseInt(input.split("T")[1].split(':')[0])-3;
		 if(hora<10){
			 hora = '0'+hora;
		 }
		 return day+'/'+month+'/'+year +" "+hora+":"+ input.split("T")[1].split(':')[1].split('.')[0];
	 }else{
		 return '-';
	 }	 
}

//Formata a data no formato YYYY-MM-DD
function formatDate2(input) {	 
	 //Ex: 2022-12-05T17:27:35.146479
	 if(input != "" && input != '' && input != null && input != undefined){
		 var datePart = input.match(/\d+/g),
		 year = datePart[0], // get only two digits
		 month = datePart[1],
		 day = datePart[2];	

		 return year+'-'+month+'-'+day ;
	 }else{
		 return '-';
	 }	 
}

function fnTraduzStatus(codStatus){
	
	if (codStatus == 0) {
		return "Pendente";
    }

    if (codStatus == 1) {
    	return "Parcialmente assinado";
    }

    if (codStatus == 2) {
    	return "Finalizado";
    }

    if (codStatus == 3) {
    	return "Todos";
    }

    if (codStatus == 4) {
    	return "Rejeitado";            
    }

    if (codStatus == 5) {
    	return "Rascunho";
    }

    if (codStatus == 6) {
    	return "Pendente";
    }  
	
}

// function getToken() {
// 	var refresh = String(hAPI.getCardValue("refreshToken"))
//     var DATASET = DatasetFactory.getDataset("dsTAERefreshToken", [JSON.stringify({ refreshToken: refresh })], null, null)

//     if(DATASET.rowsCount) {
// 		var succeeded = DATASET.getValue(0, "succeeded")
// 		var token = DATASET.getValue(0, "token")
// 		var refreshToken = DATASET.getValue(0, "refreshToken")

// 		if(succeeded) {
// 			hAPI.setCardValue("token", token)
// 			hAPI.setCardValue("refreshToken", refreshToken)

// 			return token
// 		}
//     }
// }

function getToken() {
    var DATASET_CREDENCIAIS = DatasetFactory.getDataset("dsTAEParametros", null, null, null)
    
    var usuarioTAE = DATASET_CREDENCIAIS.getValue(0, "usuarioTAE")
    var senhaTAE = DATASET_CREDENCIAIS.getValue(0, "senhaTAE")
    
    var DATASET_LOGIN = DatasetFactory.getDataset("dsTAELogin", [usuarioTAE, senhaTAE], null, null)
    var token = DATASET_LOGIN.getValue(0, "token")
    
    return token
}

// function getPrazoAceite() {
// 	var DATA_ACEITE = hAPI.getCardValue("dataAceite")
// 	var C1 = DatasetFactory.createConstraint("data_aceite", DATA_ACEITE, null, ConstraintType.MUST)
// 	var DATASET = DatasetFactory.getDataset("ds_calcularPrazo", null, [C1], null)

// 	var STATUS = DATASET.getValue(DEFAULT_INDEX, "PRAZO_EXPIRADO")
// 	return STATUS
// }