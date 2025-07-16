function validateForm(form){	
	var msg = "";
	
	// Contatos
	var contatos = form.getChildrenIndexes("tbCtts");
    if (contatos.length == 0){
        msg += "É necessário adicionar ao menos um destinatário para prosseguir";
    }else{
    	// Linha da tabela sem destinatário
        for (var i = 0; i < contatos.length; i++) {
            campo = "emailCtt___"+ contatos[i];
            if ( ( form.getValue(campo) == "" ) || ( form.getValue(campo) == null ) ) {
            	msg += "- Verifique a(s) linha(s) sem destinatário.<br>"; 
                break;
            }
        }
    }

    //Validação do anexo feita diretamente pelo diagrama//
    if (msg != ""){
		throw msg+" <br><br>";
	}

    // MELO

    // Validacão limite upload
    var LIMITE_UPLOAD = parseFloat(form.getValue("limiteUpload"))
    var TAMANHO_TOTAL_ANEXOS = parseFloat(form.getValue("tamanhoTotalAnexos"))

    if(TAMANHO_TOTAL_ANEXOS > LIMITE_UPLOAD) {
        throw "O limite de upload é de " + LIMITE_UPLOAD + "MB"
    }

    // Validar data de aceite 
    // var DATA_ACEITE = form.getValue("dataAceite")
    
    // if(DATA_ACEITE == "" || DATA_ACEITE == null) {
    //     throw "O campo <strong>DATA DE ACEITE</strong> é obrigatório"
    // }

    var MANIFESTO_PATH = form.getValue("manifestoPath")
    
    if(MANIFESTO_PATH == "" || MANIFESTO_PATH == null) {
        throw "O campo <strong>ARMAZENAR MANIFESTO EM:</strong> é obrigatório"
    }

    var NOME_ENVELOPE = form.getValue("nomeEnvelope")
    
    if(NOME_ENVELOPE == "" || NOME_ENVELOPE == null) {
        throw "O campo <strong>NOME DO ENVELOPE</strong> é obrigatório"
    }

    // Validar quantidade de caracteres no nome do anexo
    var INDEXES = form.getChildrenIndexes("documentos")
    var COD_ANEXO = 2
    var NOME_ANEXO_MAX_LENGTH = 100

    INDEXES.forEach(function(INDEX) {
        var NOME_ANEXO = String(form.getValue("documento___" + INDEX))
        var IS_ANEXO = parseInt(form.getValue("acoesDocumento___" + INDEX)) == COD_ANEXO

        if(IS_ANEXO && NOME_ANEXO.length > NOME_ANEXO_MAX_LENGTH) {
            throw NOME_ANEXO + "<br><br> <strong>O nome do arquivo em anexo deve ter entre 1 e 100 caracteres.</strong>"
        }
    })
}