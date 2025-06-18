function beforeCancelProcess(colleagueId,processId){
	var cdStatusAtividade = "";
	var cdFollowUp = "";
	var sObsExec = "";
	var sStatusAtividade = "";
	var bUpdateOk = false;
	var isService = getValue('WKIsService');
	
	cdStatusAtividade = "3";
	sStatusAtividade = "Cancelada";
		
	if (hAPI.getCardValue("cdStatusAtividade") != cdStatusAtividade){
		cdFollowUp = hAPI.getCardValue("cdFollowUp");
		sObsExec = hAPI.getCardValue("sObsExecutor");
		
		if (hAPI.getCardValue("sObsAprovador") != null && hAPI.getCardValue("sObsAprovador")!= ""){
			sObsExec = "Observações Executor :" + hAPI.getCardValue("sObsExecutor") +"\n Observações Aprovador:" + hAPI.getCardValue("sObsAprovador");	
		} 
		
		//se não existe texto no campo de executor, usar a caixa de texto que o FLUIG apresenta.
		if (sObsExec == "" || sObsExec == null){
			sObsExec = getValue("WKUserComment");
		}

		if (isService.toString() != "false"){//se estiver executando pelo protheus
			log.info("*** beforeCancelProcess: PROCESSO CANCELADO PELO SIGAJURI.");
		} else{//execução pelo Fluig
			
			bUpdateOk = updateFollowUpSIGAJURI(cdFollowUp, cdStatusAtividade, sObsExec, "0", getMailByUserId(colleagueId));
			
			if (bUpdateOk){
				hAPI.setCardValue("cdStatusAtividade", cdStatusAtividade);
				hAPI.setCardValue("sStatusAtividade", sStatusAtividade);
			} 
			else {			
				log.error("*** beforeCancelProcess: SIGAJURI NAO ATUALIZADO!");
				throw "Atenção: Ocorreu um erro ao atualizar o SIGAJURI. Por favor, tente novamente mais tarde e caso o problema persista, entre em contato com o suporte.";												
			}						   
		}
	}
}

function updateFollowUpSIGAJURI(cdFollowUp, cdStatusAtividade, sObsExec, sDocs, sMailExecutor){
	var fields = new Array();
	var constraints = new Array();
	var sort = new Array("retorno");
	var response = null;
	var sFilial = hAPI.getCardValue("sFilial");
	
	if (sDocs === undefined) {
        sDocs = "0";
	}

	if (sMailExecutor === undefined) {
        sMailExecutor = "";
	}	

	constraints.push(DatasetFactory.createConstraint("sFollowUp", cdFollowUp, cdFollowUp, ConstraintType.MUST));
	constraints.push(DatasetFactory.createConstraint("sStatus", cdStatusAtividade, cdStatusAtividade, ConstraintType.MUST));
	constraints.push(DatasetFactory.createConstraint("sObsExec", sObsExec, sObsExec, ConstraintType.MUST));
	constraints.push(DatasetFactory.createConstraint("sDocs", sDocs, sDocs, ConstraintType.MUST));
	constraints.push(DatasetFactory.createConstraint("sFilial", sFilial, sFilial, ConstraintType.MUST));
	constraints.push(DatasetFactory.createConstraint("sMailExecutor", sMailExecutor, sMailExecutor, ConstraintType.MUST));
		
	try{
		response = DatasetFactory.getDataset("dsUpdateFollowUpSIGAJURI", null, constraints, sort);
	}catch(e){
		log.error("** updateFollowUpSIGAJURI: Falha ao buscar dataset.");
		log.error("** updateFollowUpSIGAJURI: ERRO: " + e.message);
	}
	
	if (response){
		var retorno = response.getValue(0, "retorno");
		
		if (String(retorno) == "true"){
			return true;
		} else {
			log.error("*** updateFollowUpSIGAJURI: ERRO: retorno falso do SIGAJURI ");
			return false;
		}
	}	else{
		log.error("** updateFollowUpSIGAJURI: Response false ");
	}
	
	return false;
}

function getMailByUserId(cUser){
var fields      = new Array();
var constraints = new Array();
var colleagues  = null;
var UserId      = cUser;

	log.info("*** getMailByUserId: Recuperando Mail.");
	fields.push("mail");
	constraints.push(DatasetFactory.createConstraint("active", true, true, ConstraintType.MUST));
	constraints.push(DatasetFactory.createConstraint("colleaguePK.colleagueId", cUser, cUser, ConstraintType.MUST));

	try{
		colleagues = DatasetFactory.getDataset("colleague", fields, constraints, null);

		if (colleagues && colleagues.rowsCount > 0){
			UserId = colleagues.getValue(0, "mail");
		}
	}catch(e){
		log.error("*** getMailByUserId: Falha ao recuperar o dataset.");
		log.error("*** getMailByUserId: ERROR: " + e.message);
	}

	return UserId;
}
