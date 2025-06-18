function displayFields(form,customHTML){ 
	//muda o valor do campo para exibir acentuação.
	switch(parseInt(form.getValue("cdStatusAtividade"))){
	case 1: sStatusAtividade = "Pendente"; break;
	case 2: sStatusAtividade = "Concluído"; break;
	case 3: sStatusAtividade = "Cancelada"; break;
	case 4: sStatusAtividade = "Em Aprovação"; break;
	default: sStatusAtividade = "-"; break;
	}
	
	form.setValue("sStatusAtividade", sStatusAtividade );
}