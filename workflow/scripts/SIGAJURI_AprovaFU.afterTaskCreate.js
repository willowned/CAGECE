function afterTaskCreate(colleagueId) {
	var horaParts;
	var segundos = 50400;
	var lOk = false;
	var cSep = "-";
	var nDia = 2;
	var nMes = 1;
	var nAno = 0;
             
    // Recupera o numero da solicitação
    var processo = getValue("WKNumProces");
    
    if (hAPI.getCardValue("cdStatusAtividade") == "1"){
    	log.info("*** AFTERTASKCREATE - Execucao");
    	if (hAPI.getCardValue("dtPrazoTarefa") != null && hAPI.getCardValue("dtPrazoTarefa").trim().length()>0){
    	    log.info("*** AFTERTASKCREATE - Data Prazo: " + hAPI.getCardValue("dtPrazoTarefa") + " - " + hAPI.getCardValue("dtPrazoTarefa").indexOf("/"));
    	    //valida o separador entre / e -
    	    if (hAPI.getCardValue("dtPrazoTarefa").indexOf("/")>0){
        		cSep = "/";
        		nAno = 2;
        		nDia = 0;
        	}
    	    var dateParts = hAPI.getCardValue("dtPrazoTarefa").split(cSep);
    	    //valida se não está recebendo 0015..
    	    if (dateParts[nAno].substring(0,1) == "0"){
    	    	dateParts[nAno] = "2" + dateParts[nAno].substring(1);
    	    }
    		var date = new Date(dateParts[nAno], (dateParts[nMes] - 1), dateParts[nDia]); //Javascript reconhece 0 como janeiro, 1 fevereiro ....
    		lOk = true;
        }
        	
    	if (hAPI.getCardValue("sHora") != null && hAPI.getCardValue("sHora").trim().length()>0)
    		{
    		horaParts = hAPI.getCardValue("sHora").split(":");
    		if (horaParts.length == 2)
    			{
    			segundos = (Number(horaParts[0]) * 3600) + (Number(horaParts[1]) * 60);
    			}
    		else{
    			if (hAPI.getCardValue("sHora").trim().length()==4){
    				segundos = (Number(hAPI.getCardValue("sHora").trim().substring(0,2)) * 3600) + (Number(hAPI.getCardValue("sHora").trim().substring(2,4)) * 60);
    			}
    		}
    		
    	}
    }else{
    	//se estiver em aprovação
    	log.info("*** AFTERTASKCREATE - Aprovação - col:" + colleagueId);
    	if (hAPI.getCardValue("dtPrazoAprova") != null && hAPI.getCardValue("dtPrazoAprova").trim().length()>0){
    		log.info("*** AFTERTASKCREATE - Data Prazo Ap: " + hAPI.getCardValue("dtPrazoAprova") + " - " + hAPI.getCardValue("dtPrazoAprova").indexOf("/"));
    	    //valida o separador entre / e -
    	    if (hAPI.getCardValue("dtPrazoAprova").indexOf("/")>0){
        		cSep = "/";
        		nAno = 2;
        		nDia = 0;
        	}
        	var dateParts = hAPI.getCardValue("dtPrazoAprova").split(cSep);
        	
        	//valida se não está recebendo 0015..
    	    if (dateParts[nAno].substring(0,1) == "0"){
    	    	dateParts[nAno] = "2" + dateParts[nAno].substring(1);
    	    }
    	    
    		var date = new Date(dateParts[nAno], (dateParts[nMes] - 1), dateParts[nDia]); //Javascript reconhece 0 como janeiro, 1 fevereiro ....
    		lOk = true;
        }

		segundos = 61200; //17:00 do dia fatal.
    }
    
	        
    if (lOk){
		// Seta o prazo para as 14:00
		log.info("*** due setado: Dia:" + dateParts[nDia] + ", Mês:" +  dateParts[nMes] + ", Ano:" + dateParts[nAno] + ", col:" + colleagueId)
		hAPI.setDueDate(processo, 0, colleagueId, date, segundos);
	}
	
}