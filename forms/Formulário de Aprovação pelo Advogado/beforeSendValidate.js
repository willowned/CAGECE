var beforeSendValidate = function(CURRENT_STATE, NEXT_STATE){
	
	var msg = "";
	var lineBreaker = "</br>";	
	
	if(CURRENT_STATE == 5){
		if(isEmpty("rd_aprovar_prazos")){
			msg+= "- Campo 'Aprovar?' é obrigatório" + lineBreaker;
		}else if($('input[name="rd_aprovar_prazos"]:checked').val() == "nao"){
			if(isEmpty("ds_justificativa_prazos")){
				msg+= "- Campo 'Justificativa' é obrigatório" + lineBreaker;
			}
		}
	}
	
	if(msg != ""){
		msg = '<div><br><b>Validações de preenchimento do formulário: </b><br><br><b style="color: red">'+msg+"</div>";
		throw msg;
	}
}

function isEmpty(field){
	var $input = $('[name="' + field + '"]');
	if ($input.is(':checkbox') || $input.is(':radio')){
		return !$input.is(':checked');
	}else{
		return ($("#"+field).val() == null || $("#"+field).val() == undefined || $("#"+field).val() == "");
 	}	
}