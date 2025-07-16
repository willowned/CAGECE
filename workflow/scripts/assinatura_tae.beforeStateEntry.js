function beforeStateEntry(sequenceId){
	
	// Antes de entrar em Upload Arquivo / Criação do Envelope
	// if (sequenceId == 5){
	// 	var codUserLogado = getValue("WKUser");
	// 	// Antes de mais nada, testa se o usuário logado possui permissão para enviar arquivos ao TAE - tela de parametros
	// 	var c1 = DatasetFactory.createConstraint("userFluig", codUserLogado, codUserLogado, ConstraintType.MUST);
	//     var ds_getUsuariosTAE = DatasetFactory.getDataset("ds_getUsuariosTAE", null, new Array(c1), null);	
	//     // Ok, registro encontrado para o usuário logado...
	//     if( ds_getUsuariosTAE.rowsCount<=0 ){
	//     	throw " \n\n <b>Atenção</b>: seu usuário não possui permissão para enviar arquivos ao Totvs Assinatura Eletrônica. \n Verifique a tela de parâmetros do TAE, aba usuários. \n\n";
	//     }
	// }
	
	// // Reinicia nº de consultas realizadas
    // if (sequenceId == 47){
    	
    //     hAPI.setCardValue("numeroConsultas", "0")
    // }   
    
    // // Antes de finalizar, anexa o manifesto...
    if(sequenceId == 13){
    	
    	var ecm_documentId = hAPI.getCardValue("documentIdAssinado");
        // Anexa o documento criado ao processo
        hAPI.attachDocument(parseInt(ecm_documentId));
    }
}