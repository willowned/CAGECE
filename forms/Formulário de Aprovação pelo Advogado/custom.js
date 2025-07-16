$(document).ready(function() {	
	
	
	if(getFormMode() != "VIEW" && getWKNumState() == 5){
		$('input[name="rd_aprovar_prazos"]').change(function() {
			validateApprove();
		});
	}
		
	validateApprove();
	requiredFields();
});

function validateApprove(){
	if($('input[name="rd_aprovar_prazos"]:checked').val() == "nao")
		setRequired("ds_justificativa_prazos", true);
	else
		setRequired("ds_justificativa_prazos", false);
}

function requiredFields(){
	if(getFormMode() != "VIEW"){
		if(getWKNumState() == 5){
			let required_fields = ["aprovar"];
			
			$.each(required_fields, function(index, value) {
				  setRequired(value, true);
			});
		}
	}
}

function setRequired(field, required){
	(required) ? $('label[for="'+field+'"]').addClass("required") : $('label[for="'+field+'"]').removeClass("required");
}

function clearFields(names) {
	names.forEach(function(name) {
      var $input = $('[name="' + name + '"]');
      if ($input.is(':checkbox') || $input.is(':radio')) {
        $input.prop('checked', false);
      } else if ($input.attr('type') == "zoom") {
        ZOOM.clear(name);
      } else {
        $input.val('');
      }
    });
  }
