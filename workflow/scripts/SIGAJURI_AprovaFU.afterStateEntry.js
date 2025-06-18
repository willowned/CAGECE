function afterStateEntry(sequenceId){
	var INICIO = 1;
	var APROVAFU = 2;
	var APROVACAO = 6;
	var EXECUCAO = 4;
	var APROVAFU2 = 11;
	var EXECUTADO = 16;
	var FIM = 9;
	var EXECCANCEL = 23;
	
	var step = parseInt(getValue("WKCurrentState"));
	var users = new java.util.ArrayList();
	var nextState = null;
	var ExecAprova = null;
	var sDocs = "0";
	var sObs = null;
	var sStatusAtividade = "";
	
	log.info("*** afterStateEntry: Iniciando. Atividade: " + step + "/Sequence Id: " + sequenceId);
	
	switch(step){
	case 0:
	case INICIO:
		break;
	case APROVAFU:			
		hAPI.setCardValue("numSolic", getValue("WKNumProces"));
		hAPI.setCardValue("dtInicial", getCurrentDate());
		//hAPI.setCardValue("sStatusAtividade", sStatusAtividade);
		hAPI.setCardValue("sSolicitante", getUserNameByMail(hAPI.getCardValue("cdSolicitante")));
		hAPI.setCardValue("sUserExec", getUserNameByMail(hAPI.getCardValue("cdUserExec")));
		hAPI.setCardValue("sExecutorFluig", getColleagueIdByMail(hAPI.getCardValue("cdUserExec")));
		hAPI.setCardValue("sOrigem","");
		
		ExecAprova = hAPI.getCardValue("cdExecAprova");
		nextState = (ExecAprova==1?EXECUCAO:EXECUTADO);
		users.clear();
		
		if (nextState != EXECUCAO){
			//se o estado já for de executado significa que veio executado do Protheus
			users.add("System:Auto");
			hAPI.setCardValue("sOrigem","SIGAJURI");
			hAPI.setCardValue("sObsExecutor","Tarefa executada via SIGAJURI.");
		}else{
			users.add(hAPI.getCardValue("sExecutorFluig"));
		}
		hAPI.setAutomaticDecision(nextState, users, "Decisao Automatica: " + (nextState==EXECUCAO?"Encaminhado para Execução.":"Encaminhado para Aprovação."));
		break;
	case APROVACAO:
		hAPI.setCardValue("sExecutorFluig", getColleagueIdByMail(hAPI.getCardValue("cdUserExec")));
		setDueDate(hAPI.getCardValue("dtPrazoAprova"),hAPI.getCardValue("sExecutorFluig"));
		break;
	case EXECUCAO:
		log.info("*** voltou execução - valor sOrigem:" + hAPI.getCardValue("sOrigem"));
		if (hAPI.getCardValue("sOrigem") == "FLUIG"){
						
			if (!updateFollowUpSIGAJURI(hAPI.getCardValue("cdFollowUp"), 1, hAPI.getCardValue("sObsAprovador"))){
				log.error("*** afterStateEntry, EXECUÇÃO : SIGAJURI NAO ATUALIZADO!");
				throw "Erro na comunicação com o SIGAJURI";
			} else {			
				hAPI.setCardValue("cdStatusAtividade",1);
				hAPI.setCardValue("sStatusAtividade","Pendente");
			}
			hAPI.setCardValue("sOrigem","");
		}
		break;
		
	case EXECUTADO:		
		nextState = (AprovaFU()?APROVACAO:FIM);
		users.clear();
		users.add(getColleagueIdByMail(hAPI.getCardValue("cdSolicitante")));
		
		//Atualiza o status da atividade
		if (nextState == FIM) {
			hAPI.setCardValue("cdStatusAtividade",2);
			hAPI.setCardValue("sStatusAtividade","Concluído");
		}
		else {
			hAPI.setCardValue("cdStatusAtividade",4);
			hAPI.setCardValue("sStatusAtividade","Em Aprovação");
		}
				
		//se o campo sOrigem estiver preenchido, significa que a alteração de status foi feita pelo SIGAJURI.
		if (hAPI.getCardValue("sOrigem") == null || hAPI.getCardValue("sOrigem") == ""){
			
			//grava documentos na pasta do caso caso seja o final do follow-up.
			if (nextState==FIM){
				gravaDocs();
			}
			
			//Atualiza status no FW.
			if (updateFollowUpSIGAJURI(hAPI.getCardValue("cdFollowUp"),hAPI.getCardValue("cdStatusAtividade"), hAPI.getCardValue("sObsExecutor"),hAPI.getCardValue("sDocs"))) {
				hAPI.setCardValue("sOrigem","FLUIG");
				hAPI.setAutomaticDecision(nextState, (nextState==APROVACAO?getUsersAprovaFU(users):users), "Decisao Automatica após Execução: " + (nextState==APROVACAO?"Encaminhado para aprovação.":"Sem Aprovação."));
			}
			else{
				nextState = EXECUCAO;
				hAPI.setCardValue("cdStatusAtividade",1);
				hAPI.setCardValue("sStatusAtividade","Pendente");
				hAPI.setAutomaticDecision(nextState, users, "Erro na comunicação com o SIGAJURI. Retornado ao estado de execução.");
				
				throw "Erro na comunicação com o SIGAJURI";
			}			
		}else{
			//limpa o campo de origem
			hAPI.setCardValue("sOrigem","");
			hAPI.setAutomaticDecision(nextState, (nextState==APROVACAO?getUsersAprovaFU(users):users), "Tarefa concluída através do SIGAJURI. Decisao Automatica após Execução: " + (nextState==APROVACAO?"Encaminhado para aprovação.":"Sem Aprovação."));
		}
		
				
		break;
	case APROVAFU2:
		var lTarefa = false;
		
		nextState = (AprovaFU2()?APROVACAO:FIM);
		users.clear();
		users.add(getColleagueIdByMail(hAPI.getCardValue("cdSolicitante")));
				
		//Atualiza o status da atividade
		if (nextState == FIM) {
			hAPI.setCardValue("cdStatusAtividade",2);
			hAPI.setCardValue("sStatusAtividade","Concluído");
		}
		else {
			hAPI.setCardValue("cdStatusAtividade",4);
			hAPI.setCardValue("sStatusAtividade","Em Aprovação");
		}
		
		//Atualiza status no FW.
		if (nextState == FIM){
			ExecAprova = hAPI.getCardValue("cdExecAprova");
			sObs = (ExecAprova==1?hAPI.getCardValue("sObsExecutor"):hAPI.getCardValue("sObsAprovador"));
			sObs = "";
			sObs = "Observações Executor :" + hAPI.getCardValue("sObsExecutor") ;
			
			if (hAPI.getCardValue("sObsAprovador") != null && hAPI.getCardValue("sObsAprovador")!= ""){
				sObs = "Observações Executor :" + hAPI.getCardValue("sObsExecutor") +"\n Observações Aprovador:" + hAPI.getCardValue("sObsAprovador");	
			}
						
			//grava documentos na pasta do caso caso seja o final do follow-up.
			gravaDocs();
			
			if (updateFollowUpSIGAJURI(hAPI.getCardValue("cdFollowUp"),hAPI.getCardValue("cdStatusAtividade"), sObs,hAPI.getCardValue("sDocs"), getMailByUserId(getValue("WKUser")))){
				lTarefa = true; //marca na variável que o status foi mudado com sucesso no SIGAJURI.
			} else {
				log.info("Erro AfterStateEntry ADR: Retorno negativo do SIGAJURI ao atualizar para FIM.");
			}
		}
		
		if (lTarefa || nextState== APROVACAO){
			//Avança a tarefa para o final ou aprovação novamente.
			hAPI.setAutomaticDecision(nextState, (nextState==APROVACAO?getUsersAprovaFU(users):users), "Decisao Automatica após Aprovação: " + (nextState==APROVACAO?("Encaminhado para o próximo nível de aprovação. Observações registradas:"+hAPI.getCardValue("sObsAprovador")):"Aprovado em definitivo."));
		}
		
		//limpa o campo de aprovador caso a tarefa precise de mais uma aprovação.
		if (nextState== APROVACAO){
			hAPI.setCardValue("sObsAprovador","");
		}
			
		
		break;
	case EXECCANCEL:
		//faz o cancelamento do follow-up no SIGAJURI
		
		var cdStatusAtividade = "";
		var cdFollowUp = "";
		var sObsExec = "";
		var sStatusAtividade = "";
		var bUpdateOk = false;
		
		cdStatusAtividade = "3";
		sStatusAtividade = "Cancelada";
		
		if (hAPI.getCardValue("cdStatusAtividade") != cdStatusAtividade){
								
			cdFollowUp = hAPI.getCardValue("cdFollowUp");
			sObsExec = hAPI.getCardValue("sObsExecutor");
			
			bUpdateOk = updateFollowUpSIGAJURI(cdFollowUp, cdStatusAtividade, sObsExec);
			
			if (!bUpdateOk){
				log.info("*** EXECCANCEL: SIGAJURI NAO ATUALIZADO!");
			} else {			
				hAPI.setCardValue("cdStatusAtividade", cdStatusAtividade);
				hAPI.setCardValue("sStatusAtividade", sStatusAtividade);
			}
		}
		
		break;
	}
}

function getCurrentDate(){
	var Now = new Date();
	var yyyy = Now.getFullYear().toString();
	var mm = (Now.getMonth()+1).toString();
	var dd  = Now.getDate().toString();
	return (dd[1]?dd:"0"+dd[0]) + "/" + (mm[1]?mm:"0"+mm[0]) + "/" + yyyy;
}

function getUsersAprovaFU(users){
	var sConfig = null;
	if (hAPI.getCardValue("sConfigs") != null){
		sConfig = hAPI.getCardValue("sConfigs").split(",");

		if (!(sConfig[0] == null || sConfig[0] == "")){
			var pool = getGrupoRole(parseInt(sConfig[0]));
			if (pool != null){
				log.info("*** getUsersAprovaFU: Adicionando Grupo e Papel ou Aprovador a Pool.");
				users.clear();

				if ( pool.getValue(0, "cdAprovadorSIGAJURI") == "0" || pool.getValue(0, "cdAprovadorSIGAJURI") == "" ){
					if (pool.getValue(0,"cdPapel") > ""){
						users = getCommonUsers(pool.getValue(0, "cdGrupo"), pool.getValue(0, "cdPapel"), users);
					}else{ //valida se o papel não esta preenchido para mandar ao pool de usuários do grupo
						users.add("Pool:Group:"+pool.getValue(0, "cdGrupo"));
					}
				}else{
					users.add( getAprovadorSigajuri(pool.getValue(0, "cdAprovadorSIGAJURI")) );
				}
			}
			var novoConfigs = new Array();
			for (var i = 1; i < sConfig.length; i++){
				novoConfigs.push(sConfig[i]);
			}
			hAPI.setCardValue("sConfigs", novoConfigs.join(","));
		}
	}
	
	return users;
}

function getGrupoRole(cardId){
	log.info("*** getGrupoRole: Recuperando Grupo e Papel ou Aprovador.");
	var fields = new Array();
	var constraints = new Array();
	var sort = new Array();
	var configs = null;
	
	fields.push("cdGrupo");
	fields.push("cdPapel");
	fields.push("cdAprovadorSIGAJURI");
	
	constraints.push(DatasetFactory.createConstraint("metadata#active", true, true, ConstraintType.MUST));
	constraints.push(DatasetFactory.createConstraint("metadata#id", cardId, cardId, ConstraintType.MUST));

	try{
		configs = DatasetFactory.getDataset("wcmSIGAJURI_FollowUp", fields, constraints, sort);
	}catch(e){
		log.error("*** getGrupoRole: Falha ao recuperar o dataset.");
		log.error("*** getGrupoRole: ERROR: " + e.message);
	}
	return configs;
}

function getCommonUsers(Group, Role, users){
	var fields = new Array();
	var constraints = new Array();
	var sort = new Array();
	var dsGroupUsers = null;
	var dsRoleUsers = null;
	
	log.info("*** getCommonUsers: Recuperando Usuarios do grupo " + Group);
	
	log.info("*** getCommonUsers: Campos Group.");
	fields.push("colleagueGroupPK.colleagueId");
	
	log.info("*** getCommonUsers: Constraints Group.");
	constraints.push(DatasetFactory.createConstraint("colleagueGroupPK.companyId", getValue("WKCompany"), getValue("WKCompany"), ConstraintType.MUST));
	constraints.push(DatasetFactory.createConstraint("colleagueGroupPK.groupId", Group, Group, ConstraintType.MUST));
	
	try{
		dsGroupUsers = DatasetFactory.getDataset("colleagueGroup", fields, constraints, sort);
	}catch(e){
		log.error("*** getCommonUsers: Falha ao recuperar o dataset Group.");
		log.error("*** getCommonUsers: ERROR: " + e.message);
	}
	
	log.info("*** getCommonUsers: Recuperando Usuarios do papel  " + Role);
	
	fields = new Array();
	constraints = new Array();
	
	log.info("*** getCommonUsers: Campos Role.");
	fields.push("workflowColleagueRolePK.colleagueId");
	
	log.info("*** getCommonUsers: Constraints Role.");
	constraints.push(DatasetFactory.createConstraint("workflowColleagueRolePK.companyId", getValue("WKCompany"), getValue("WKCompany"), ConstraintType.MUST));
	constraints.push(DatasetFactory.createConstraint("workflowColleagueRolePK.roleId", Role, Role, ConstraintType.MUST));
	
	try{
		dsRoleUsers = DatasetFactory.getDataset("workflowColleagueRole", fields, constraints, sort);
	}catch(e){
		log.error("*** getCommonUsers: Falha ao recuperar o dataset Role.");
		log.error("*** getCommonUsers: ERROR: " + e.message);
	}

	
	if (dsGroupUsers && dsGroupUsers.rowsCount > 0 && dsRoleUsers && dsRoleUsers.rowsCount > 0){
		for (var i = 0; i < dsGroupUsers.rowsCount; i++){
			for (var j = 0; j < dsRoleUsers.rowsCount; j++){
				if (dsGroupUsers.getValue(i, "colleagueGroupPK.colleagueId") == dsRoleUsers.getValue(j, "workflowColleagueRolePK.colleagueId")){
					log.info("*** getCommonUsers: Adicionando Usuario " + dsGroupUsers.getValue(i, "colleagueGroupPK.colleagueId"));
					users.add(dsGroupUsers.getValue(i, "colleagueGroupPK.colleagueId"));
					break;
				}
			}
		}
	}
	
	if (users.isEmpty()){
		log.info("*** getCommonUsers: Lista Vazia, Adicionando Usuario Executor");
		users.add(hAPI.getCardValue("cdUserExec"));
	}
	
	return users;
}

function getAprovadorSigajuri(cdAprovadorSIGAJURI){
	var constraints = new Array();
	var response = null;
	var user = "";
	
	constraints.push(DatasetFactory.createConstraint("sFilial"			 	, hAPI.getCardValue("sFilial")	, hAPI.getCardValue("sFilial")	, ConstraintType.MUST));
	constraints.push(DatasetFactory.createConstraint("sCajuri"				, hAPI.getCardValue("sCajuri")	, hAPI.getCardValue("sCajuri")	, ConstraintType.MUST));
	constraints.push(DatasetFactory.createConstraint("cdAprovadorSIGAJURI"	, cdAprovadorSIGAJURI			, cdAprovadorSIGAJURI			, ConstraintType.MUST));
		
	try{
		response = DatasetFactory.getDataset("dsAprovadorSigajuri", null, constraints, null);
	}catch(e){
		log.error("** dsAprovadorSigajuri: ERRO: " + e.message);
	}

	user = getColleagueIdByMail( response.getValue(0, "sEmailAprovador") );
	
	log.info("*** getAprovadorSigajuri - Recuperando aprovador SIGAJURI: " + user);	
	
	return user;
}

function getUserNameByLogin(Login){
	var fields = new Array();
	var constraints = new Array();
	var sort = new Array();
	var colleagues = null;
	var userName = Login;
	
	fields.push("colleagueName");
	
	constraints.push(DatasetFactory.createConstraint("active", true, true, ConstraintType.MUST));
	constraints.push(DatasetFactory.createConstraint("login", Login, Login, ConstraintType.MUST));
	
	try{
		log.info("*** getUserNameByLogin: Chamando Dataset.");
		colleagues = DatasetFactory.getDataset("colleague", fields, constraints, sort);
		
		log.info("*** getUserNameByLogin: Processando UserName.");
		if (colleagues && colleagues.rowsCount > 0){
			userName = colleagues.getValue(0, "colleagueName");
		}
	}catch(e){
		log.error("*** getUserNameByLogin: Falha ao recuperar o dataset.");
		log.error("*** getUserNameByLogin: ERROR: " + e.message);
	}
	
	return userName;
}

function AprovaFU(){	
	var cdAssJur = hAPI.getCardValue("cdAssJur");
	var cdTipoFU = hAPI.getCardValue("cdTipoFU");
	var configs = null;
	var result = new Array();
	var nValor1 = 0;
	var nValor2 = 0;
	var cTmp = "";
	var nValor = 0;
	var nLength = 0;
	
	var fields = new Array("metadata#id", "sPrioridade","cdAssJur","sFaixaInicial","sFaixaFinal");
	var constraints = new Array();
	constraints.push(DatasetFactory.createConstraint("metadata#active", true, true, ConstraintType.MUST));
	constraints.push(DatasetFactory.createConstraint("cdTipoFU", cdTipoFU, cdTipoFU, ConstraintType.MUST));
	var order = new Array("sPrioridade");
	
	//Converte o valor recebido no follow-up
	cTmp = hAPI.getCardValue("sValor");
	
	nValor = parseFloat(cTmp);
	
	if (isNaN(nValor)){
		nValor = 0;
		log.error("*** AprovaFU: Valor do FW zerado.");
	}
	
	
	try {
		configs = DatasetFactory.getDataset("wcmSIGAJURI_FollowUp", fields, constraints, order);
	}catch(e){
		log.error("*** AprovaFU: Falha ao buscar dataset.");
		log.error("*** AprovaFU: ERRO: " + e.message);
	}
	if (!configs || configs.rowsCount <= 0){
		log.info("*** AprovaFU: Nenhuma configuração encontrada. Não havera aprovacao.");
		return false;
	}
	
	log.info("*** AprovaFU: Processando dados encontrados.");
	for (var i = 0; i < configs.rowsCount; i++){
		log.info("*** AprovaFU: Avaliando " + configs.getValue(i, "cdAssJur"));
		if (configs.getValue(i, "cdAssJur") == "*" || configs.getValue(i, "cdAssJur") == cdAssJur){
			
			//Valida os valores cadastrados
			cTmp = configs.getValue(i, "sFaixaInicial");
			
			if (cTmp == ""){
				cTmp = "0";
			}
			
			if (cTmp != null){
				cTmp = cTmp.replace(".","");
				cTmp = cTmp.replace(",",".");
			}else{
				cTmp = "";
			}
				
			nValor1 = parseFloat(cTmp);
						
			cTmp = configs.getValue(i, "sFaixaFinal");
			
			if (cTmp == ""){
				cTmp = "0";
			}
			
			if (cTmp != null){
				cTmp = cTmp.replace(".","");
				cTmp = cTmp.replace(",",".");
			}else{
				cTmp = "";
			}
			
			nValor2 = parseFloat(cTmp);
			
			if (isNaN(nValor1)){
				nValor1 = 0;
			}
			
			if (isNaN(nValor2)){
				nValor2 = 0;
			}
			
			//Se a faixa final for 0, não considera
			if (nValor2 == 0 && nValor == 0){
				result.push(configs.getValue(i, "metadata#id"));
				log.info("*** AprovaFU: Incluindo faixa 2 ou valor fw zerado " + configs.getValue(i, "metadata#id"));
			}else if (nValor >= nValor1 && nValor <= nValor2){
				result.push(configs.getValue(i, "metadata#id"));
				log.info("*** AprovaFU: Incluindo " + configs.getValue(i, "metadata#id"));
			}
		}
	}
	
	nLength = result.length;
	if (nLength == null){
		nLength = 0;
	} 
	
	//valida se houve rsultado válido
	if (nLength == 0){
		log.info("*** AprovaFU: Nenhuma configuração válida encontrada. Não haverá aprovação.");
		return false;
	}else{
		//linhas válidas.
		hAPI.setCardValue("sConfigs", result.join(","));
	}
	
	log.info("*** AprovaFU: Campo Configs salvo corretamente. Havera aprovacao.");
	
	return true;
	
}

function AprovaFU2(){
	var sConfigs = new Array();
	if (hAPI.getCardValue("sConfigs") != null){
		sConfigs = hAPI.getCardValue("sConfigs").split(",");
		
		if (sConfigs[0] == null || sConfigs[0] == "") return false;
	}else{
		return false;
	}
	
	
	return true;
}

function getUserNameByMail(Email){
	log.info("*** getUserNameByMail: Recuperando UserName.");
	var fields = new Array();
	var constraints = new Array();
	var sort = new Array();
	var colleagues = null;
	var userName = Email;
	
	fields.push("colleagueName");
	
	constraints.push(DatasetFactory.createConstraint("active", true, true, ConstraintType.MUST));
	constraints.push(DatasetFactory.createConstraint("mail", Email, Email, ConstraintType.MUST));
	
	try{
		colleagues = DatasetFactory.getDataset("colleague", fields, constraints, sort);
		
		if (colleagues && colleagues.rowsCount > 0){
			userName = colleagues.getValue(0, "colleagueName");
		}
	}catch(e){
		log.error("*** getUserNameByMail: Falha ao recuperar o dataset.");
		log.error("*** getUserNameByMail: ERROR: " + e.message);
	}
	
	return userName;
}

function getColleagueIdByMail(Email){
	var fields = new Array();
	var constraints = new Array();
	var sort = new Array();
	var colleagues = null;
	var colID = Email.trim();
	
	fields.push("colleaguePK.colleagueId");
	
	constraints.push(DatasetFactory.createConstraint("active", true, true, ConstraintType.MUST));
	constraints.push(DatasetFactory.createConstraint("mail", colID, colID, ConstraintType.MUST));
	
	try{
		
		colleagues = DatasetFactory.getDataset("colleague", fields, constraints, sort);
		
		if (colleagues && colleagues.rowsCount > 0){
			colID = colleagues.getValue(0, "colleaguePK.colleagueId");
			log.info("*** getColleagueIdByMail: encontrei " + colID);
		}else{
			log.info("*** getColleagueIdByMail: nao encontrei user.");
		}
	}catch(e){
		log.error("*** getColleagueIdByMail: Falha ao recuperar o dataset.");
		log.error("*** getColleagueIdByMail: ERROR: " + e.message);
	}
	
	return colID;
}

function gravaDocs(){
	var calendar = java.util.Calendar.getInstance().getTime();
	var attachments = hAPI.listAttachments();
	var nParentFolder =  Number(hAPI.getCardValue("sPastaCaso"));
	var aDocs = [];
	var curDoc;
	var nLenAdoc = 0;
	
	if (hAPI.getCardValue("sDocs") != null && hAPI.getCardValue("sDocs") != ""){
		aDocs = hAPI.getCardValue("sDocs").split(";");
	}
	
	for (var i = 0; i < attachments.size(); i++) {
        var doc = attachments.get(i);
         
        if (doc.getDocumentType() != "7" && aScan(aDocs,doc.getDocumentId()) == true) {
            continue;
        }
         
        curDoc = doc.getDocumentId();
        
        doc.setParentDocumentId(nParentFolder);
        doc.setVersionDescription("Processo: " + getValue("WKNumProces"));
        doc.setExpires(false);
        doc.setCreateDate(calendar);
        doc.setInheritSecurity(true);
        doc.setTopicId(1);
        doc.setUserNotify(false);
        doc.setValidationStartDate(calendar);
        doc.setVersionOption("0");
        doc.setUpdateIsoProperties(true);
         
        try{
        	hAPI.publishWorkflowAttachment(doc);
        	aDocs.push(curDoc);
        }catch (e) {
	        log.error("*** gravaDocs Problemas na criação do documento:\n" + e);
        }
    }
    
	nLenAdoc = aDocs.length;
	if (nLenAdoc == null){
		nLenAdoc = 0;
	} 
		
    log.info("**** docs gravados: " + aDocs.length);
    
	if (nLenAdoc > 0){
    	//grava documentos
    	hAPI.setCardValue("sDocs", aDocs.join(";"));
    }
    
}

function aScan(aX,cVal){
	var index;
		
	for	(index = 0; index < aX.length; index++) {
	    if (aX[index] == cVal){
	    	return true;
	    }
	}
	
	return false;
}

function setDueDate(sData,colleagueId){
	var segundos = 50400;
	var cSep = "-";
	var nDia = 2;
	var nMes = 1;
	var nAno = 0;
	var processo = getValue("WKNumProces");
	
	if (sData != null && sData.trim() != "" && sData != ""){
		
		//valida o separador entre / e -
	    if (sData.indexOf("/")>0){
    		cSep = "/";
    		nAno = 2;
    		nDia = 0;
    	}
	    
		var dateParts = sData.split(cSep);	    
		var dtPrazo = new Date(dateParts[nAno], (dateParts[nMes] - 1), dateParts[nDia]); //Javascript reconhece 0 como janeiro, 1 fevereiro ....
		
		hAPI.setDueDate(processo, 0, colleagueId, dtPrazo, segundos);
	}
}
	