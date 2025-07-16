function displayFields(form,customHTML){
	form.setShowDisabledFields(true);
    form.setHidePrintLink(true);
	
	var atividade = getValue("WKNumState");
	var process  = getValue("WKNumProces");
	var modo = form.getFormMode();
	var usuario = fluigAPI.getUserService().getCurrent();
	var matricula = getValue("WKUser");
	
	customHTML.append("<script>function getWKNumState(){ return " + atividade + "; }</script>");
	customHTML.append("<script>function getFormMode(){ return '" + form.getFormMode() + "'; }</script>");
	customHTML.append("<script>function getUser(){ return '" + getValue("WKUser") + "'; }</script>");
	customHTML.append("<script>function getCompany(){ return " + getValue("WKCompany") + "; }</script>");
	customHTML.append("<script>function getMobile(){ return " + form.getMobile() + "; }</script>");
	customHTML.append("<script>function getProcessId(){ return " + process + "; }</script>");
	
	form.setShowDisabledFields(true);
	
	if(modo == "ADD"){
	}
	else if(modo != "VIEW" && (atividade == 5 || atividade == 19)){
	}
	
}

function getCurrentDate(){
	var dateCorrente = new Date();
	var formatoData = new java.text.SimpleDateFormat("dd/MM/yyyy");
	
	return formatoData.format(dateCorrente);
} 

function getCurrentHour(){
	var dateCorrente = new Date();
	var formatoData = new java.text.SimpleDateFormat("HH:mm");
	
	return formatoData.format(dateCorrente);
} 