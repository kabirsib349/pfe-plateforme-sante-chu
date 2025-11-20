package com.pfe.backend.service;

import com.pfe.backend.model.*;
import com.pfe.backend.repository.FormulaireMedecinRepository;
import com.pfe.backend.repository.ReponseFormulaireRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.core.io.ByteArrayResource;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;

class ExportReponsesServiceTest {

    @Test
    void exporterReponsesCsv_retourne_un_csv_contenant_les_champs_et_valeurs() {
        // Mock du formulaire médecin
        Formulaire formulaire = new Formulaire();
        Champ champ = new Champ();
        champ.setIdChamp(1L);
        champ.setLabel("Age");
        champ.setType(TypeChamp.NOMBRE);
        formulaire.setChamps(List.of(champ));

        Utilisateur chercheur = new Utilisateur();
        chercheur.setEmail("chercheur@test.com");

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(10L);
        fm.setFormulaire(formulaire);
        fm.setChercheur(chercheur);

        FormulaireMedecinRepository fmRepo = Mockito.mock(FormulaireMedecinRepository.class);
        Mockito.when(fmRepo.findById(anyLong())).thenReturn(Optional.of(fm));

        ReponseFormulaire reponse = new ReponseFormulaire();
        reponse.setChamp(champ);
        reponse.setValeur("18");
        reponse.setDateSaisie(LocalDateTime.now());

        ReponseFormulaireRepository repRepo = Mockito.mock(ReponseFormulaireRepository.class);
        Mockito.when(repRepo.findByFormulaireMedecinId(anyLong()))
                .thenReturn(List.of(reponse));

        ExportReponsesService service = new ExportReponsesService(fmRepo, repRepo);

        ByteArrayResource csvResource = service.exporterReponsesCsv(10L, "chercheur@test.com");
        String csv = new String(csvResource.getByteArray());

        assertThat(csv).contains("numero_question;nom_variable;label;type;unite;valeur;date_saisie");
        assertThat(csv).contains("Age");
        assertThat(csv).contains("18");
    }
}
