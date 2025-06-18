function beforeTaskSave(colleagueId,nextSequenceId,userList){
	var INICIO = 1;
	var APROVAFU = 2;
	var APROVACAO = 6;
	var EXECUCAO = 4;
	var APROVAFU2 = 11;
	var EXECUTADO = 16;
	var FIM = 9;
	
	var step = parseInt(getValue("WKCurrentState"));
	
	var cdStatusAtividade = "";
	var cdFollowUp = "";
	var sObsExec = "";
	var sStatusAtividade = "";
	var bUpdateOk = false;
	
	switch(step){
	case INICIO:
	case APROVAFU:
	case APROVAFU2:
	case EXECUCAO:
		hAPI.setCardValue("sStatusAtividade", "Pendente");
		break;
	case APROVACAO:
		if (nextSequenceId==EXECUCAO){
			cdStatusAtividade = "1";
			sStatusAtividade = "Pendente";
			hAPI.setCardValue("sOrigem", "FLUIG");
		}
	case EXECUTADO:
		break;
	case FIM:
		/*cdStatusAtividade = "2";
		sStatusAtividade = "Concluída";
			
		cdFollowUp = hAPI.getCardValue("cdFollowUp");
		sObsExec = hAPI.getCardValue("sObsExecutor");
		
		bUpdateOk = updateFollowUpSIGAJURI(cdFollowUp, cdStatusAtividade, sObsExec);
		
		if (!bUpdateOk){
			log.error("*** beforeTaskSave, " + step + ": SIGAJURI NAO ATUALIZADO!");
		} else {			
			hAPI.setCardValue("cdStatusAtividade", cdStatusAtividade);
			hAPI.setCardValue("sStatusAtividade", sStatusAtividade);
		}*/
		
		break;
	}	
}