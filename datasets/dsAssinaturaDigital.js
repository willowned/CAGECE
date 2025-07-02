function createDataset(fields, constraints, sortFields) {
	//Dataset que ira retornar o e-mail do aprovador a partir dos participantes do processo VIA Webservice (NSZ).
	
	var dsRetorno = DatasetBuilder.newDataset();
	var sOtp = "";
	var sCpf = "";
	var sDocumentId = "";
	
	// Recupera valores do dataset de parametros (Login e senha de Admin e Id da Empresa) para chamar o webservice.
	var dsParamsSIGAJURI   = DatasetFactory.getDataset("dsParamsSIGAJURI", new Array(), new Array(), null);
	var sFluigHostname     = dsParamsSIGAJURI.getValue(0, "sFluigHostname");     //http://187.94.56.75:8080
	var sOathAppPublic     = dsParamsSIGAJURI.getValue(0, "sOathAppPublic");     //adminsoluti
	var sOathAppPrivate    = dsParamsSIGAJURI.getValue(0, "sOathAppPrivate");    //adminsoluti 
	var sOathTokenPublic   = dsParamsSIGAJURI.getValue(0, "sOathTokenPublic");   //9bb4b054-698b-4d38-95f0-953c96072e37
	var sOathTokenPrivate  = dsParamsSIGAJURI.getValue(0, "sOathTokenPrivate");  //bb7b515a-c841-48d5-82f2-4cfcf656272bc1839644-346a-4744-a01d-abe0f770db0e
	var sFormIdContrato    = dsParamsSIGAJURI.getValue(0, "nFormIdContrato");
	
	dsRetorno.addColumn("order");
	dsRetorno.addColumn("return");
	dsRetorno.addColumn("message");
	dsRetorno.addColumn("sOtp");
	dsRetorno.addColumn("sDocumentId");
	dsRetorno.addColumn("sCpf");
	dsRetorno.addColumn("sStatus");
	
	try{
		for (var i = 0; i < constraints.length; i++){			
			if (constraints[i].fieldName == "sOtp"){
				sOtp = constraints[i].initialValue;
			} else if (constraints[i].fieldName == "sDocumentId"){
				sDocumentId = constraints[i].initialValue;
			} else if (constraints[i].fieldName == "sCpf") {
				sCpf = constraints[i].initialValue;
			}
		}
		sCpf = sCpf.replace(".","");
		sCpf = sCpf.replace("-","");
		log.info("*** dsAssinaturaDigital - CPF [" + sCpf + "] IdDocumento [" + sDocumentId + "] OTP [" + sOtp + "]");
			
		// OAuth variables 
		
		/*Consumer Key
		Consumer Secret
		Token Access
		Token Secret
		var myApiConsumer = oauthUtil.getGenericConsumer(OAUTH_APP_PUBLIC,OAUTH_APP_PRIVATE, OAUTH_USER_APP_PUBLIC, OAUTH_USER_APP_SECRET); 
		*/
		 //var sTesteURL = "http://187.94.56.75:8080/api/public/ecm/document/listDocument/12";
		 //var myApiConsumer = oauthUtil.getGenericConsumer(sOathAppPublic,sOathAppPrivate, sOathTokenPublic, sOathTokenPrivate);
		 //var data = myApiConsumer.get(sTesteURL);
		 
		 //dsRetorno.addRow(new Array(0,JSON.stringify(data),sOtp));
		 //var servicoURL = "http://187.94.56.75:8080/vaultid/api/list/file/3224";
		 var urlList     = sFluigHostname + "/api/public/ecm/document/listDocument/" + sFormIdContrato.toString();
		 var apiConsumer = oauthUtil.getGenericConsumer(sOathAppPublic,sOathAppPrivate, sOathTokenPublic, sOathTokenPrivate);
		 var getResult   = apiConsumer.get(urlList);
		
		 var servicoURL    = sFluigHostname + "/vaultid/api/list/file/" + sDocumentId;
		 var myApiConsumer = oauthUtil.getGenericConsumer(sOathAppPublic,sOathAppPrivate, sOathTokenPublic, sOathTokenPrivate);
		 var data          = myApiConsumer.get(servicoURL);
		 
		 if(data== null){
		     throw new Exception("Retorno está vazio");
		 }else{
			 var sRetGet = JSON.parse(data);
			 
			 if (sRetGet.message.message == "OK"){
				 sRetGet = JSON.stringify(sRetGet.content);
				 
				 var post = "[" + sRetGet + "]";
				 log.info("*** dsAssinaturaDigital - Retorno: GET [" + sRetGet + "]");
				 dsRetorno.addRow(new Array(1,post,sOtp,null,null,null,JSON.stringify(sRetGet.message)));
				 
				 var postUrl = sFluigHostname + "/vaultid/api/document/sign/" + sCpf  + ":" + sOtp;
				 var postReturn = myApiConsumer.post(postUrl,post);
				 var postParse = JSON.parse(postReturn);
				 
				 if(postReturn == null || postReturn == ''){
				     throw new Exception("Retorno está vazio");
				 } else {
					 log.info("*** dsAssinaturaDigital - Retorno: Post [" + JSON.stringify(postParse) + "]");
					 dsRetorno.addRow(new Array(2,postReturn,'',postParse.StatusCod,sDocumentId,sCpf));
				 }
			 }
		 }
	}
	catch(e){
		log.info("*** dsRetorno - Erro: " + (e.message));
		dsRetorno.addRow(new Array(9,e.message,'',sOtp,sDocumentId,sCpf));
	}
	
	return dsRetorno;
}