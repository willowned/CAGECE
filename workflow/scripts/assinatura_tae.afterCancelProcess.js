function afterCancelProcess(colleagueId,processId){
	
	hAPI.setCardValue("solicitacaoStatus", "Cancelada");

	// Exclui o documento enviado ao TAE...	
	var docID = hAPI.getCardValue("idDoc");
	var token = getToken();
	
	if( docID!="" && docID!= null ){
		var c10 = DatasetFactory.createConstraint("idDocumento", docID, null, ConstraintType.MUST);
		var c11 = DatasetFactory.createConstraint("token", String(token), null, ConstraintType.MUST);
	    var constraints2 = new Array(c10, c11);
	    
	    var dsTAEDeletarEnvelope = DatasetFactory.getDataset("dsTAEDeletarEnvelope", null, [c10, c11], null);
	    
	    if( dsTAEDeletarEnvelope.rowsCount>0 ){
	    	
	    	// Testando status da publicação...
	    	if(dsTAEDeletarEnvelope.getValue(0, 'success') == 'false' || dsTAEDeletarEnvelope.getValue(0, 'success') == false){
	    		throw " \n\n <b>Atenção</b>: "+dsTAEDeletarEnvelope.getValue(0, 'message')+"\n\n";
	    	}// caso contrário, ok segue...
	    	
	    }else{
	    	throw " \n\n <b>Atenção</b>: erro ao carregar o dsTAEDeletarEnvelope - retorno vazio. Contate o administrador da plataforma. \n\n";
	    }
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