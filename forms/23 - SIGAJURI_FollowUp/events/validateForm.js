function validateForm(form){

	if (form.getFormMode() == "MOD"){
		switch(parseInt(form.getValue("cdStatusAtividade"))){
		case 1: //Pendente
			if (form.getValue('sObsExecutor') == null || form.getValue('sObsExecutor') == ""){
				throw "Favor preencher as observações de execução.";
			}
			break;
		case 4: //"Em Aprovação"
			if (form.getValue('sObsAprovador') == null || form.getValue('sObsAprovador') == ""){
				throw "Favor preencher as observações de aprovação.";
			}
			break;
		
		}
	}

}
