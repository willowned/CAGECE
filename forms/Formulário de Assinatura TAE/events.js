// Variáveis e constantes globais
const ID_MODAL = "modal-destinatarios"
const CONFIRMAR_MODAL = "modal-confirmar"
const CANCELAR_MODAL = "data-dismiss"
const TABLE_NAME = "tbCtts"
const MODAL_CLASS = ".modal-dialog"
const STORAGE_KEY = "USER_CREDENTIALS"
const INITIAL_VALUE = 1
const DEFAULT_INDEX = 0
const TDN = "https://tdn.totvs.com/pages/viewpage.action?pageId=635757029#PreenchendoFormul%C3%A1rio--480125392"
var myLoading = FLUIGC.loading(window, {
	textMessage:  'Carregando dados...'
});
let EMAILS, PAPEIS, CURRENT_EDITED_ROW, UPLOAD_LIMIT, CONTATOS_AGENDA, GRUPOS, URL_BASE, MODAL_MODE = "ADD"

// Número das atividades
const EVENTO_INICIO = 4

$(document).ready(async () => {
	// Esconde coluna Ordem dos Contatos
	$(".colOrdemAssCtt").css("display", "none")
	$(".colEmailCtt").css("width", "80%")
	
	await getServiceDomain()
	// Verifica se existe uma sessão ativa de usuário
	getLocalStorage()
	ColOrdem()
	addOrderElement()
	repopularSelect()
	aplicarBinds()
})

function aplicarBinds() {
	const FORM_MODE = getFormMode()
	const TASK = getWKNumState()
	
	// $(parent.document).find("#ecm-navigation-inputFile-clone").attr("accept", ".doc, .docx, .pdf")

	$(`body`).on("change", ":input[id*=ordemAss___]", e => {
		const [ID, INDEX] = e.target.id.split("___")
		const SELECT = $(`:input[id*=${ID}___]`)

		Array.from(SELECT).map(ELEMENT => {
			const INPUT_AUX = $(ELEMENT).parent().find(`[type="hidden"]`)
			INPUT_AUX.val(ELEMENT.value)
		})
	})
	
	$(document).on("click", `[${CONFIRMAR_MODAL}]`, e => {
		e.preventDefault()

		const ACTIVE_TAB = $(e.target).closest(".modal-dialog").find(".nav-tabs").find(".active").text().trim()

		switch(ACTIVE_TAB) {
			case "Contato da agenda":
				const CONTATOS_SELECIONADOS = getContatosSelecionados()
				renderContatosSelecionados(CONTATOS_SELECIONADOS)
				break

			case "Grupo da agenda":
				const GRUPOS = getMembrosGrupo()
				renderContatosSelecionados(GRUPOS)
				break

			case "Novo destinatário":
				novoDestinatario(e.target)
				break
		}
	})

	$(document).on("click", `[${CANCELAR_MODAL}]`, e => {
		MODAL_MODE == "EDIT" ? resetModal() : ""
	})

	$(document).on("change", `#tipoAuth`, e => {
		const CASE = e.target.value
		const SECTION = $(e.target).closest(".modal-body").find(".codigo-email")
		
		switch (CASE) {
			case "2":
				SECTION.fadeIn()
				break
		
			default:
				SECTION.fadeOut()
				SECTION.find(":input").val("")
				break
		}
	})

	$(document).on("change", `#tipoIdentificacao`, e => {
		const CASE = e.target.value
		const NEXT_ROW = $(e.target).parent().next()
		
		switch (CASE) {
			case "1":
				NEXT_ROW.fadeIn()
				aplicarMascaras()
				break
			
			case "2":
				NEXT_ROW.fadeIn()
				NEXT_ROW.find(":input").unmask()
				break		
		
			default:
				NEXT_ROW.fadeOut()
				NEXT_ROW.find(":input").val("")
				break
		}
	})

	$(`body`).on("click", ".edit-button", e => {
		const ROW = $(e.target).closest("tr").find(":input")
		const [, CURRENT_ROW] = ROW.attr("id").split("___")

		MODAL_MODE = "EDIT"
		CURRENT_EDITED_ROW = CURRENT_ROW

		incluirDestinatario()
		editarDestinatario(ROW)
	})

	$(`body`).on("click", ".view-button", e => {
		const ROW = $(e.target).closest("tr").find(":input")

		incluirDestinatario()
		editarDestinatario(ROW)
	})

	$(`body`).on("click", "#utilizaOrdemAss", e => {
		const TABLE_LENGTH = $(`#${TABLE_NAME} tbody tr:gt(0)`).length
		const CHECKED = $(e.target).is(":checked")

		if(CHECKED && TABLE_LENGTH <= INITIAL_VALUE) {
			e.preventDefault()
			dispararAlerta({icone: "warning", titulo: "Atenção", mensagem: `Para utilizar a ordem de assinaturas são necessários pelo menos dois destinatários.`})
		}
		else hideColOrdem()
	})

	// parent.ECM.attachmentTable.on("change", (a, b) => {
	// 	console.log(a)
	// })

	$(document).on("click", `.add-files`, e => {
		const TARGET = $(parent.document).find(`#ecm-navigation-inputFile-clone`)
		TARGET.trigger("click")
	})

	$(document).on("click", `.check-all`, e => {
		const CHECKBOX = $(`#documentos`).find(`[type="checkbox"]:gt(0)`)
		const IS_CHECKED = $(`#documentos`).find(`[type="checkbox"]:gt(0)`).is(":checked")

		IS_CHECKED ? CHECKBOX.prop("checked", false) : CHECKBOX.prop("checked", true)
	})

	$(`body`).on("click", `#login .btn-primary`, e => {
		const INPUTS = $(e.target).closest(".modal-dialog").find("input")
		const ID = `#${$(`.btn-primary`).closest(".modal").attr("id")}`
		const [EMAIL, SENHA] = INPUTS

		validarLogin(EMAIL.value, SENHA.value)
	})
	
	$(parent.document).on("change", `input[type="file"]`, e => {
		const [EVENT] = $(e.currentTarget)
		const FILES = Array.from(EVENT.files)

		renderFiles(FILES)
	})

	$(parent.document).on("change", `#ecm-navigation-inputFile-clone`, e => {
		const [EVENT] = $(e.currentTarget)
		const FILES = Array.from(EVENT.files)

		renderFiles(FILES)
	})

	$(parent.document).on("click", "[data-attachment-finddocuments]", e => {
		const SELECTED_ROWS = Array.from($(e.target).parent().closest(".modal-content").find(`[type=checkbox]:checked:not([data-documenttype="1"]`))
		const FOLDER = Array.from($(e.target).parent().closest(".modal-content").find(`[type=checkbox]:checked:not([data-documenttype="2"]`))

		if(FOLDER && FOLDER.length) {
			const documentId = $(FOLDER).attr("data-documentid")
			const description = $(FOLDER).closest("td").next().text().trim()

			$(`#manifestoPath`).val(`${documentId} - ${description}`)
		}

		const SELECTED_IDS = SELECTED_ROWS.map(ROW => {
			const documentId = $(ROW).attr("data-documentid")
			const description = $(ROW).closest("td").next().text().trim()

			return {documentId, description}
		})
	
		renderFiles(SELECTED_IDS)
	})

	$(`body`).on("click", ".search-folder", e => {
		$(parent.document).find("[data-attachments-load-ged]").trigger("click")
	})

	// Inclusão do destinatário
	$(`.js-add`).on("click", _ => incluirDestinatario())

	// Logout
	$(`.js-logout`).on("click", _ => logout())

	// Abertura modal ECM
	$(`.ecm-search`).on("click", _ => $(parent.document).find("[data-attachments-load-ged]").trigger("click"))

	// Validar data aceite
	$(`#dataAceite`).on("change", e => {
		const IS_GREATER = validarDataAceite(e.target.value)

		if(IS_GREATER) {
			alerta("A data de aceite não pode ser maior que a data de expiração do envelope.", "error")
			$(e.target).focus().val("")
		}
	})

	$(`#dataExpiracao`).on("change", _ => $(`#dataAceite`).trigger("change"))

	// Abre documentação
	$(`.doc`).on("click", _ => window.open(TDN, "_blank"))

	// Validações para quando o form estiver em modo de visualização
	FORM_MODE == "VIEW" ? viewMode() : ""
	
	// Renderiza os arquivos vindos do processo pai
	getFiles()
}

function renderFiles(FILES) {
	FILES.map(FILE => {
		const INDEX = wdkAddChild("documentos")
		const NAME = FILE.name || FILE.description
		const SIZE = byteToMB(FILE.size) || getFileSize(FILE.documentId)

		$(`#documento___${INDEX}`).val(NAME)
		$(`#fileSize___${INDEX}`).val(SIZE)
	})

	renderFileSize()
}

function renderContatosSelecionados(CONTATOS) {
	CONTATOS.map(CONTATO => {
		customAddFilho(TABLE_NAME)

		const INDEX = newId
		const {email, acao, papelAssinante, tipoAutenticacao, nomeCompleto, tipoIdentificacao, identificacao} = CONTATO
		
		$(`#emailCtt___${INDEX}`).val(email)
		$(`#tipoAss___${INDEX}`).val(acao)
		$(`#papelAssinante___${INDEX}`).val(papelAssinante)
		$(`#tipoAuth___${INDEX}`).val(tipoAutenticacao)
		$(`#nomeCompleto___${INDEX}`).val(nomeCompleto)
		$(`#tipoIdentificacao___${INDEX}`).val(tipoIdentificacao)
		$(`#documentoIdentificacao___${INDEX}`).val(identificacao)
	})
			
	$(`#${ID_MODAL}`).modal("hide")
}

function novoDestinatario(TARGET) {
	const VALIDATE = validarForm()

	if(!VALIDATE.length) {
		MODAL_MODE == "ADD" ? customAddFilho(TABLE_NAME) : ""

		const INPUTS = Array.from($(TARGET).parent().siblings().closest(".modal-body").find(":input"))
		const INDEX = CURRENT_EDITED_ROW ? CURRENT_EDITED_ROW : newId

		INPUTS.map(INPUT => {
			const DATA_FIELD_ID = $(INPUT).attr("data-field-id")
			const ID = DATA_FIELD_ID ? DATA_FIELD_ID : INPUT.id
			const VALUE = INPUT.value
			
			$(`#${ID}___${INDEX}`).val(VALUE)
		})
				
		MODAL_MODE == "EDIT" ? resetModal() : ""
		$(`#${ID_MODAL}`).modal("hide")
	}
	else dispararAlerta({icone: "error", titulo: "Atenção", mensagem: `Verifique os erros abaixo e tente novamente:<br><br> ${VALIDATE.join("<br>")}`})
}

async function setLocalStorage(refreshToken) {
	localStorage.setItem("TAE", JSON.stringify({ refreshToken }))
}

function getLocalStorage() {
	const LOCAL_STORAGE = localStorage.getItem(STORAGE_KEY)
	const { refreshToken } = LOCAL_STORAGE ? JSON.parse(LOCAL_STORAGE) : ""

	myLoading.show();
	LOCAL_STORAGE ? getRefreshToken(refreshToken) : validarLogin()
}

async function getUserProfile(token) {
	const URL = `${URL_BASE}/identityintegration/api/users/profile`

	const OPTIONS = {
        method: "GET",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Bearer ${token}`
        }
    }

	const RESPONSE = await fetch(URL, OPTIONS)
    const { data, succeeded, description } = await RESPONSE.json()

	return data
}

function getRefreshToken(setRefreshToken) {
	const dataset = DatasetFactory.getDataset("dsTAERefreshToken", [JSON.stringify({ refreshToken: setRefreshToken })]).values

	if(dataset && dataset.length) {
		// Atualiza token
		const [{ refreshToken, token }] = dataset
		setFunctionalities(token, refreshToken)
	}
	else logout()
	
	myLoading.hide();
}

function logout() {
	$(`.sessao-config__wrapper`).fadeOut()
	localStorage.removeItem("TAE")
	solicitarLogin()
}

function setUsuarioLogado(USER) {
	$(`.sessao-config__wrapper`).fadeIn()
	$(`.active-user`).html(`<i class="far fa-user"></i> ${USER}`)
}

async function validarLogin() {
	const DATASET = DatasetFactory.getDataset("dsTAEParametros", null, null, null).values
	const userName = DATASET[0].usuarioTAE;
	const password = DATASET[0].senhaTAE;
	const END_POINT = `${URL_BASE}/identityintegration/v2/auth/login`

	const body = {
					method: "POST",
					headers: {"Content-Type": "application/json"},
					body: JSON.stringify({userName, password})
				};
	
	
	const PROMISE = await fetch(END_POINT, body)
	const { succeeded, description, data } = await PROMISE.json()
	const RESPONSE_CODE = succeeded ? 200 : 400

	switch (RESPONSE_CODE) {
		case 200:
			const { token, refreshToken } = data
			setFunctionalities(token, refreshToken)
			break

		case 400:
			alerta(description, "error")
			break	
	}
	
	myLoading.hide();
}

async function setFunctionalities(token, refreshToken) {
	const { email } = await getUserProfile(token)

	setLocalStorage(refreshToken)

	getContatosAgenda(token)
	getGrupos(token)
	setUsuarioLogado(email)

	$(`.modal`).modal("hide")
	$(`#token`).val(token)
	$(`#refreshToken`).val(refreshToken)
	
	// Tamanho do envelope da empresa
	UPLOAD_LIMIT = "500";//getUploadLimit()
	renderFileSize()
	
	// Salva em um campo hidden o limite de upload 
	$(`#limiteUpload`).val(UPLOAD_LIMIT)
	
	// Busca os papéis dos assinantes
	PAPEIS = getPapeisAssinantes(token)
		
	// Busca e-mails
	EMAILS = getEmails(token)
}

function getPapeisAssinantes(token) {
	const DATASET = DatasetFactory.getDataset("dsTAEListaRolesAssinantes", [String(token)], null, null).values
	return DATASET.map(EL => `<option>${EL.PAPEL}</option>`)
}

function getFileSize(DOCUMENTID) {
	let size = 0;
	
	if(DOCUMENTID != 0){		
		const C1 = DatasetFactory.createConstraint("documentPK.documentId", DOCUMENTID, DOCUMENTID, ConstraintType.MUST)
		const [DATASET] = DatasetFactory.getDataset("document", null, [C1], null).values
		const {size} = DATASET
	}
	
	return size;
}

function renderFileSize() {
	const FILE_SIZE_MB = getFilesMegabytes()

	$(`.file-size`).html(`<i class="far fa-hdd"></i> <strong>${FILE_SIZE_MB.toFixed(2)}MB</strong> de <strong>${UPLOAD_LIMIT}MB</strong>`)
	$(`#tamanhoTotalAnexos`).val(FILE_SIZE_MB)
}

function deleteAttachment(DELETED_FILE_NAME) {
	const ATTACHMENT_OPEN = Array.from($(parent.document).find(".table-datatable").find("[data-attachment-open]"))
	const TARGET = ATTACHMENT_OPEN.filter(FILE => $(FILE).text() == DELETED_FILE_NAME ? FILE : "")

	$(TARGET).closest("tr").find("[data-attachment-remove]").trigger("click")
	$(TARGET).closest("body").find(`[aria-labelledby="Remover anexo"]`).find(".btn-primary").trigger("click")
}

function getFilesMegabytes() {
	const FILE_SIZE = Array.from($(`:input[id*=fileSize___]`))
	const MEGA_BYTES = FILE_SIZE.reduce((pv, cv) => pv + Number(cv.value), DEFAULT_INDEX)

	return MEGA_BYTES
}

function byteToMB(BYTES) {
	return BYTES / (1024 ** 2)
}

function validarDataAceite(DATA_ACEITE) {
	const DATA_EXPIRACAO = $(`#dataExpiracao`).val()
	return moment(DATA_ACEITE) > moment(DATA_EXPIRACAO)
}

function solicitarLogin() {
	renderizarModal({content: loginHTML(), title: "", openLabel: "ENTRAR", id: "login", size: "large"})
	$(`${MODAL_CLASS} .btn-primary`).html(`<i class="fas fa-sign-in-alt"></i> ENTRAR`)
	$(`.btn-default`).hide()
}

function getFiles() {
	const FILES = parent.ECM.attachmentTable.getData()
	const TABLE_LENGTH = $(`#${TABLE_NAME} tbody tr:gt(0)`).length

	!TABLE_LENGTH && FILES.length ? renderFiles(FILES) : ""
}

function alerta(message, icon) {
	const TOAST = Swal.mixin({
        toast: true,
        icon,
        title: "General Title",
        animation: true,
        position: "center",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: toast => {
          toast.addEventListener("mouseenter", Swal.stopTimer)
          toast.addEventListener("mouseleave", Swal.resumeTimer)
        }
    })

    TOAST.fire({title: message, icon})
}

function getUploadLimit() {
	const TOKEN = $(`#token`).val()
	const [DATA] = DatasetFactory.getDataset("dsTAEAuthenticatedUser", [TOKEN], null, null).values

	return DATA.UPLOAD_LIMIT_MB
}

function viewMode() {
	const DESTINATARIOS = $(`#destinatarios`)
	const DESTINATARIOS_BUTTON = DESTINATARIOS.find("button")
	const DESTINATARIOS_REMOVE = $(".remove-button:gt(0)")
	const BUTTON_GROUP = $(".button-group")
	const MAIN_TARGET = $(`#${TABLE_NAME} tbody tr:gt(0)`)
	const EDIT_BUTTON = MAIN_TARGET.find(".edit-button")
	const VIEW_BUTTON = MAIN_TARGET.find(".view-button")

	EDIT_BUTTON.hide()
	DESTINATARIOS_BUTTON.hide()
	DESTINATARIOS_REMOVE.closest("td").hide()
	VIEW_BUTTON.show()
	BUTTON_GROUP.hide()
}

function aplicarMascaras() {
	const [CPF_LENGTH, CNPJ_LENGTH] = [11, 14]
	
	const OPTIONS = {
		onKeyPress: (cpf, ev, el, op) => {
			const [CNPJ, CPF] = ["000.000.000-000", "00.000.000/0000-00"]
			$(`.cpfOuCnpj`).mask((cpf.length > CNPJ_LENGTH) ? CPF : CNPJ, op)
		}
	}
	
	$(`.cpfOuCnpj`).length > CPF_LENGTH ? $(`.cpfOuCnpj`).mask(`00.000.000/0000-00`, OPTIONS) : $(`.cpfOuCnpj`).mask(`000.000.000-00#`, OPTIONS)
}

function removerMascaraID(CNPJ_CPF) {
	return CNPJ_CPF.replace(/\D/g, "")
}

function validarForm() {
	const INPUTS = Array.from($(`#${ID_MODAL} .required:visible`).parent().find(":input"))
	
	const VALIDATE = INPUTS.flatMap(INPUT => {
		const LABEL = $(INPUT).closest(".form-group").find("label").text()
		const MSG = `Preencha o campo <strong>${LABEL}</strong>`

		return !INPUT.value ? MSG : []
	})

	return VALIDATE
}

function getContatosAgenda(TOKEN) {
	$.ajax({
		type: 'GET',
		contentType: 'application/json',
		dataType: 'json',
		url: 'https://totvssign.staging.totvs.app/contact/v2/contatos',		
		success: function (data) {
			
		}
	});
	
	/*const C1 = DatasetFactory.createConstraint("token", TOKEN, TOKEN, ConstraintType.MUST)
	const [DATASET] = DatasetFactory.getDataset("dsTAEContatosAgenda", null, [C1], null).values
	const {RESPONSE_JSON} = DATASET

	CONTATOS_AGENDA = JSON.parse(RESPONSE_JSON).data*/
}

function getGrupos(TOKEN) {
	const C1 = DatasetFactory.createConstraint("token", TOKEN, TOKEN, ConstraintType.MUST)
	const [DATASET] = DatasetFactory.getDataset("dsTAEGrupos", null, [C1], null).values
	const {RESPONSE_JSON} = DATASET

	GRUPOS = JSON.parse(RESPONSE_JSON).data
}

function getAutor() {
	const [DATASET] = DatasetFactory.getDataset("ds_paramsTAE").values
	const {emailTAE} = DATASET

	return emailTAE
}

function getEmails(token) {
	// const EMAIL_AUTOR = getAutor()
	const C1 = DatasetFactory.createConstraint("desBusca", "a", "a", ConstraintType.MUST)
	const C2 = DatasetFactory.createConstraint("token", String(token), String(token), ConstraintType.MUST)
	const DATASET = DatasetFactory.getDataset("dsTAEListaRecentes", null, [C1, C2], null).values

	return DATASET.map(ELEMENT => ELEMENT.email)

	// return DATASET.map(ELEMENT => ELEMENT.email).filter(EMAIL => !EMAIL.includes(EMAIL_AUTOR))
}

function renderizarModal(CONFIG) {
    FLUIGC.modal({
        title: CONFIG.title,
        content: CONFIG.content,
        id: CONFIG.id,
        size: CONFIG.size,
        actions: [{
            "label": CONFIG.openLabel,
            "bind": CONFIG.open,
        },
		{
            "label": "FECHAR",
            "bind": CONFIG.close,
            "autoClose": true
        }]
    }, (err, data) => console.log(err))
}

function incluirDestinatario() {
	const CONFIG = {
		content: destinatariosHTML(), 
		title: "", 
		id: "modal-destinatarios",	
		open: "modal-confirmar",
		openLabel: "CONFIRMAR", 
		close: "modal-cancelar",
		size: "full"
	}

	renderizarModal(CONFIG)
	aplicarMascaras()
	setOrdemAssinatura()
	handlerModal()
	autocomplete()
}

function editarDestinatario(ROW) {
	const INPUTS = Array.from(ROW)
	const MODAL_INPUTS = $(`#${ID_MODAL} :input:not(button)`)
	const MODAL_BUTTONS = $(`#${ID_MODAL} button:gt(0)`)
	const FORM_MODE = getFormMode() != "ADD"
	const SELECT = $(`${MODAL_CLASS} select`)

	INPUTS.map(INPUT => {
		const [FIELD_ID] = INPUT.id.split("___")
		const DATA_FIELD_ID = $(INPUT).attr("data-field-id")
		const ID = DATA_FIELD_ID ? DATA_FIELD_ID : FIELD_ID

		$(`${MODAL_CLASS} #${ID}`).val(INPUT.value)
	})

	// if(FORM_MODE) {
	// 	MODAL_INPUTS.addClass("blocked")
	// 	MODAL_BUTTONS.hide()
	// }

	SELECT.trigger("change")
}

function resetModal() {
	MODAL_MODE = "ADD", CURRENT_EDITED_ROW = ""
}

function autocomplete() {
	const autoCompleteJS = new autoComplete({
		selector: "#email",
		data: {src: EMAILS},
		resultsList: {
			element: (list, data) => {
				const RESULTS_LENGTH = data.results.length 
				const MATCHES_LENGTH = data.matches.length
				const INFO = document.createElement("p")
				const RESULT = RESULTS_LENGTH == INITIAL_VALUE ? "resultado" : "resultados"
				const [SHOW_RESULT, NO_RESULT] = [`Exibindo <strong>${RESULTS_LENGTH}</strong> de <strong>${MATCHES_LENGTH}</strong> ${RESULT}`, `Não foram encontrados resultados para <strong>"${data.query}"</strong>`]

				RESULTS_LENGTH ? INFO.innerHTML = SHOW_RESULT : INFO.innerHTML = NO_RESULT

				list.prepend(INFO)
			},
			noResults: true,
		},
		resultItem: {
			highlight: true,
		}
	})

	autoCompleteJS.input.addEventListener("selection", event => {
		const feedback = event.detail
		const selection = feedback.selection.value
		autoCompleteJS.input.blur()

		autoCompleteJS.input.value = selection
	})
}

function handlerModal() {
	const BUTTON = $(`${MODAL_CLASS} .btn-primary`)
	const CANCEL_BUTTON = $(`${MODAL_CLASS} .modal-footer .btn+.btn`)
	const [MAIN_TITLE] = $(`.modal-title`)
	const [ADD, EDIT, CANCEL] = [`<i class="far fa-check-square"></i> CONFIRMAR`, `<i class="fas fa-redo-alt"></i> ATUALIZAR`, `<i class="far fa-window-close"></i> FECHAR`]

	switch (MODAL_MODE) {
		case "ADD":
			BUTTON.html(ADD)
			break

		case "EDIT":
			BUTTON.html(EDIT)
			break
	}

	CANCEL_BUTTON.html(CANCEL)
	// $(MAIN_TITLE).html(`<i class="fas fa-user-plus"></i> Incluir destinatário`)
}

function setOrdemAssinatura() {
	const TABLE_LENGTH = $(`#${TABLE_NAME} tbody tr:gt(0)`).length
	const ORDEM_ATUAL = TABLE_LENGTH ? TABLE_LENGTH + INITIAL_VALUE : INITIAL_VALUE

	$(`#ordemAssinatura`).val(ORDEM_ATUAL).attr("max", ORDEM_ATUAL)
}

function validarEmail(email) {
    return /^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/.test(email)
}

function dispararAlerta(settings) {
    Swal.fire({
        icon: settings.icone,
        title: settings.titulo,
        html: settings.mensagem
    })
}

function ColOrdem() {
	if (!$('#utilizaOrdemAss').is(':checked')) {
		$(".colOrdemAssCtt").css("display", "none");
		$(".colEmailCtt").css("width", "80%");
	} else {
		$(".colOrdemAssCtt").css("display", "table-cell");
		$(".colEmailCtt").css("width", "60%");
	}
}

function validaCkAssinar() {

	if ($('#assinarEnviar').is(':checked')) {
		$("#tpAssResp").css("display", "block");
	} else {
		$("#tpAssResp").css("display", "none");
	}
}

function showColOrdem() {
	if (!$('#utilizaOrdemAss').is(':checked')) {
		// $(".colOrdemAssCtt").css("display", "none");
		$(".colEmailCtt").css("width", "80%");
		$(".ordemAssAux").css("display", "none");
		// $(".ordemAss").css("display", "none");
		$(".hide-paiFilho").css("display", "none");
	} else {
		// $(".colOrdemAssCtt").css("display", "table-cell");
		$(".colEmailCtt").css("width", "60%");
		$(".ordemAssAux").css("display", "block");
		// $(".ordemAss").css("display", "none");
		$(".hide-paiFilho").css("display", "none");
	}
}

function hideColOrdem() {
	if ($('#utilizaOrdemAss').is(':checked')) {

		$(".colOrdemAssCtt").css("display", "table-cell");
		$(".colEmailCtt").css("width", "60%");
	} else {

		$(".colOrdemAssCtt").css("display", "none");
		$(".colEmailCtt").css("width", "80%");
	}
}

function showCamera() {
	JSInterface.showCamera()
}

function customAddFilho(linha) {
	// Adicionar um filho
	wdkAddChild(linha)
	addOrderElement()
}

function customDeleteLinha(element) {
	// Remove um filho
	const DELETED_FILE = $(element).closest("tr").find(":input[id*=documento___]").val()
	fnWdkRemoveChild(element)
	deleteOrderElement(element)
	renderFileSize()
	deleteAttachment(DELETED_FILE)
}

// function selecionaTipoAssPadrao() {
// 	var maior = 0;
// 	$('select[id^="tipoAss___"]').each(function () {
// 		var id = this.id;
// 		console.log(id.slice(10, id.length) + ' > ' + maior);
// 		if (parseInt(id.slice(10, id.length)) > maior) {
// 			maior = id.slice(10, id.length);
// 		}
// 	})
// 	$('#tipoAss___' + maior + ' option')[0].selected = true;
// }

// function verificaLogin() {

// 	if ($("#emailTAE").val() != "" && $("#pswTAE").val() != "") {

// 		var usuario = $("#emailTAE").val();
// 		var senha = $("#pswTAE").val();
// 		var data = "{\"userName\":\"" + usuario + "\",\"password\":\"" + senha + "\"}"

// 		var req = {
// 			"async": true,
// 			"crossDomain": true,
// 			"url": "https://totvssign.staging.totvs.app/identityintegration/api/auth/login",
// 			"method": "POST",
// 			"headers": {
// 				"Accept": "application/json",
// 				"Content-Type": "application/json"
// 			},
// 			"processData": false,
// 			"data": data
// 		};

// 		$.ajax(req).done(function (response) {

// 			FLUIGC.toast({
// 				title: 'Atenção:',
// 				message: 'Login Confirmado',
// 				type: 'success',
// 				timeout: 9999
// 			});

// 			$("#TokenUsuario").val(response.data.token);
// 			$("#loginValido").val("true");

// 			//sendDoc(response);

// 		});
// 	}
// }

// function sendDoc(response) {
// 	var base64Doc = "VGVzdGUgQXJxdWl2bw==";
// 	var base64str = "";

// 	// decode base64 string, remove space for IE compatibility
// 	var binary = atob(base64str.replace(/\s/g, ''));
// 	var len = binary.length;
// 	var buffer = new ArrayBuffer(len);
// 	var view = new Uint8Array(buffer);
// 	for (var i = 0; i < len; i++) {
// 		view[i] = binary.charCodeAt(i);
// 	}

// 	// create the blob object with content-type "application/pdf"
// 	var blob = new Blob([view], { type: "application/pdf" });
// 	var url = URL.createObjectURL(blob);

// 	var file = new File([blob], "teste.pdf", { type: "application/pdf" });
// 	var tokenUsuario = $("#TokenUsuario").val();
// 	// var formData = JSON.stringify(blob);

// 	var formData = new FormData();
// 	formData.append("file", file);
// 	formData.append("type", "application/pdf");
// 	//formData.append("name", "name.pdf");

// 	console.log(formData)
// 	console.log(file)

// 	if (tokenUsuario != "") {

// 		$.ajax({
// 			url: 'https://totvssign.staging.totvs.app/storage/api/Storage',
// 			data: formData,
// 			type: 'POST',
// 			contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
// 			processData: false, // NEEDED, DON'T OMIT THIS
// 			headers: {
// 				Accept: "*/*",
// 				Authorization: "Bearer" + " " + tokenUsuario
// 			},
// 			success: function (ret) {
// 				retorno = ret;
// 				console.log(ret);

// 				FLUIGC.toast({
// 					title: 'Atenção:',
// 					message: 'Documento enviado',
// 					type: 'success',
// 					timeout: 9999
// 				});
// 			}
// 			// ... Other options like success and etc
// 		});

// 	}
// }

//fnMostrarOcultarDIV - Ocultar ou mostrar uma "div" via classe
function fnMostrarOcultarDIVClass(valor, campo) {
	var buscaDiv = document.getElementsByClassName(valor)[0];
	if (buscaDiv.style.display == 'none') {
		buscaDiv.style.display = 'block';
	} else {
		buscaDiv.style.display = 'none';
	}
}

function changeOrderElement(elemento) {
	const valorSelecionado = elemento.value
	const selectAntigoValor = Array.from($(".selectOrder"))
		.filter(select => (select.value == valorSelecionado && select.id != elemento.id))[0]
	const valorAtual = elemento.value
	const valorAntigo = elemento.dataset.oldValue

	selectAntigoValor.value = valorAntigo
	selectAntigoValor.dataset.oldValue = valorAntigo
	elemento.dataset.oldValue = valorAtual
}

function deleteOrderElement(btnDeleteRow) {
	const ORDEM_LINHA_REMOVIDA = $(btnDeleteRow).closest("tr").find(".selectOrder").val()
	recalcularOrdem(ORDEM_LINHA_REMOVIDA)
	$(`.selectOrder:gt(0)`).find(`option:last`).remove()
}

function addOrderElement() {
	const TABLE_LENGTH = $("#tbCtts tbody tr:gt(0)").length
	const optionsHtml = Array.from(Array(TABLE_LENGTH).keys())
		.map(INDEX => `<option value="${++INDEX}">${INDEX}</option>`)
	const oldOrder = Array.from($(".selectOrder")).map(select => ({
		value: select.value, id: select.id
	}))
	$(".selectOrder:gt(0)").html(optionsHtml)
	oldOrder.map(order => $(`#${order.id}`).val(order.value))
	$(".selectOrder").last().val(TABLE_LENGTH)
	$(".selectOrder").last()[0].dataset.oldValue = TABLE_LENGTH
}

function recalcularOrdem(ORDEM_REMOVIDA) {
	const SELECT = Array.from($(`select[id^="ordemAss___"]`))
	const SUB = SELECT.flatMap(ELEMENT => ELEMENT.value > ORDEM_REMOVIDA ? ELEMENT : [])

	Array.from(SUB).map(el => {
		let NUMBER = Number(el.value)
		let [, ROW] = el.id.split("___")

		$(el).val(--NUMBER)
		$(el).attr("data-old-value", NUMBER)
	})
}

function bloquearCampos() {
	$(`:input`).parent().addClass("blocked")
}

async function getServiceDomain() {
    const URL = `/ecm/api/rest/ecm/ecmservices/findByType`
    const serviceCode = "TAE"

    const OPTIONS = {
        method: "GET"
    }

    const RESPONSE = await fetch(URL, OPTIONS)
    const DATA = await RESPONSE.json()

    const { content } = DATA
    
    return content.find(service => {
        const { dataService: { dataServicePK: { dataServiceName }, dataServiceURL } } = service
        
        if(dataServiceName == serviceCode) {
            URL_BASE = dataServiceURL
			$(`#endpoint`).val(URL_BASE)
        }
    })
} 

function repopularSelect() {
	const SELECT = Array.from($(`:input[id*=ordemAssValor___]`))

	if(SELECT.length) {
		SELECT.map(ELEMENT => {
			const INPUT = $(ELEMENT).parent().find("select")
			INPUT.val(ELEMENT.value)
		})
	}
}