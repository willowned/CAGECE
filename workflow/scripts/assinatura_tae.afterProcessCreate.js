function afterProcessCreate(processId){
	
    hAPI.setCardValue("numSolicitacao", processId);
    hAPI.setCardValue("solicitacaoStatus", "Aberta");
}