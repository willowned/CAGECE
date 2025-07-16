var DEFAULT_INDEX = 0
var DEFAULT_FOLDER = 4734

function servicetask12(attempt, message) {
    var ENVELOPE_ID = hAPI.getCardValue("idDoc")
    var TOKEN = getToken()
    getManifesto(ENVELOPE_ID, TOKEN)
}

function getManifesto(DOC_ID, TOKEN) {
    var C1 = DatasetFactory.createConstraint("IdDocumento", DOC_ID, DOC_ID, ConstraintType.MUST)
    var C2 = DatasetFactory.createConstraint("token", String(TOKEN), String(TOKEN), ConstraintType.MUST)
    var DATASET = DatasetFactory.getDataset("dsTAEDownloadEnvelopeAux", null, [C1, C2], null)
    var SUCCESS = DATASET.getValue(DEFAULT_INDEX, "succeeded")

    if(SUCCESS) {
        var FOLDER_ID = createFolder()
        publicarGED(DATASET, FOLDER_ID)
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

function publicarGED(DATASET, PARENT_ID) {
    var FILE_BYTES = DATASET.getValue(DEFAULT_INDEX, "fileBytes")
    var FILE_NAME = DATASET.getValue(DEFAULT_INDEX, "fileName")
    var DOCUMENT_TYPE = "2"
    var USER = getValue("WKUser")
    var DECODED_STRING = getDecodedString(FILE_BYTES)
    var ATTACHMENTS = hAPI.listAttachments()
    var DOC = ATTACHMENTS.get(DEFAULT_INDEX)
    var ATTACH_ARRAY = new java.util.ArrayList()
    var MAIN_ATTACH = docAPI.newAttachment()

    docAPI.copyDocumentToUploadArea(DOC.getDocumentId(), DOC.getVersion())   

    DOC.setDocumentId(DEFAULT_INDEX)
    DOC.setParentDocumentId(PARENT_ID)

    MAIN_ATTACH.setFilecontent(DECODED_STRING)
    MAIN_ATTACH.setFileName(FILE_NAME)
    MAIN_ATTACH.setPrincipal(true)
    MAIN_ATTACH.setAttach(false)
    ATTACH_ARRAY.add(MAIN_ATTACH)

    DOC.setDocumentDescription(FILE_NAME)
    DOC.setPhisicalFile(FILE_NAME)
    DOC.setDocumentType(DOCUMENT_TYPE)
    DOC.setActiveVersion(true)
    DOC.setColleagueId(USER)
    DOC.setPublisherId(USER)

    try {
        var FILE = docAPI.createDocument(DOC, ATTACH_ARRAY, null, null, null)
    } catch (e) {
        
    }
    
    // Atualiza código do documento assinado
    hAPI.setCardValue("documentIdAssinado", FILE.getDocumentId())
}

function getDecodedString(FILE_BYTES) {
    return java.util.Base64.getDecoder().decode(new String(FILE_BYTES))
}

function createFolder() {
    var NOME_ENVELOPE = String(hAPI.getCardValue("nomeArquivo"))
    var PARENT_ID = parseInt(getFolderId(hAPI.getCardValue("manifestoPath")))
    var ENVELOPE = getEnvelopeName(NOME_ENVELOPE)

    try {
        var DOC = docAPI.newDocumentDto()
        DOC.setDocumentDescription(gerarEnvelopeName(ENVELOPE))
        DOC.setDocumentType("1")
        DOC.setParentDocumentId(PARENT_ID ? PARENT_ID : DEFAULT_FOLDER)
        DOC.setDocumentTypeId("")
          
        var FOLDER = docAPI.createFolder(DOC, null, null)
        var DOCUMENTID = FOLDER.getDocumentId()
        
        return DOCUMENTID
    } catch (e) {
        log.error("Problemas na criação da pasta:\n" + e)
    }
}

function getFolderId(PATH) {
    return PATH.split("-")[DEFAULT_INDEX]
}

function getEnvelopeName(NAME) {
    return NAME.split(".")[DEFAULT_INDEX]
}

function gerarEnvelopeName(NAME) {
    var WKNumProces = getValue("WKNumProces")

    return WKNumProces + " - " + NAME
}