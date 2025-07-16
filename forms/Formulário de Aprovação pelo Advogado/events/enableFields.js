function enableFields(form){ 
	var atividade = getValue("WKNumState");
	
	if(atividade != 5){
		form.setEnabled("rd_aprovar_prazos", false);
		form.setEnabled("ds_justificativa_prazos", false);
	}
}