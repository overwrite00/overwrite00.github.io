---
title: "Analisi tecnica del phishing: Spoofing, protocolli e tecniche di evasione"
description: "Approfondimento tecnico sul phishing: analizziamo header email, spoofing, protocolli SPF/DKIM/DMARC e tecniche di evasione."
category: "Security Awareness"
date: "2026-02-08"
author: "CybersecurityZen"
image: "assets/images/phishing-analysis.png"
tags:
  - cybersecurity
  - phishing
  - infosec
  - DMARC
  - mfa
  - difesa digitale
  - spoofing
draft: false
---

## Analisi Tecnica del Phishing: Sotto il cofano dell’attacco

![Immagine di apeertura](/assets/images/phishing-analysis.png)

Dopo aver compreso la psicologia dietro l'inganno, è necessario analizzare l'infrastruttura tecnologica che permette al phishing di circolare e le contromisure necessarie per neutralizzarlo. La sicurezza informatica non è un prodotto statico, ma un processo stratificato che unisce consapevolezza e strumenti tecnici.

Il successo di un'email di phishing dipende spesso dalla sua capacità di superare i filtri di sicurezza (Antispam e Gateway). Per farlo, gli attaccanti manipolano i protocolli di comunicazione standard che regolano il funzionamento della posta elettronica.

## Lo Spoofing dell'Header (Identità falsificata)

Il protocollo **SMTP** (Simple Mail Transfer Protocol), pilastro della posta elettronica nato negli anni '80, è intrinsecamente insicuro poiché non richiede una verifica nativa dell'identità del mittente. Un attaccante può manipolare due diversi tipi di indirizzi:

* **Envelope From (MAIL FROM):** L'indirizzo tecnico usato dai server per l'instradamento del messaggio.
* **Header From (Friendly From):** L'indirizzo visualizzato nel tuo client (es. `sicurezza@paypal.it`).

Analizzando il codice sorgente (header) di un'email di phishing, si nota spesso che questi due campi non coincidono: l'attaccante usa un server autorizzato per l'invio, ma "trucca" l'intestazione visibile per ingannare la vittima.

## La Triade della Difesa: SPF, DKIM e DMARC

Per risolvere le vulnerabilità dell'SMTP, sono stati introdotti tre protocolli che lavorano in sinergia tramite i record DNS del dominio:

| Protocollo | Funzione Principale | Metodo di Verifica |
|:-----------|:--------------------|:-------------------|
| **SPF (Sender Policy Framework)** | Autorizzazione IP   | Specifica quali indirizzi IP sono autorizzati a inviare email per conto di un dominio. |
| **DKIM (DomainKeys Identified Mail)** | Integrità contenuto | Aggiunge una firma crittografica all'intestazione per garantire che il contenuto non sia stato alterato durante il transito. |
| **DMARC (Domain-based Message Authentication, Reporting, and Conformance)** | Policy Decision     | Indica al server ricevente come gestire l'email (es. rifiutarla o metterla in quarantena) se i controlli SPF o DKIM falliscono. |

```bash
# Verifica del record SPF per identificare i server autorizzati
# Questo comando mostra la lista di IP e domini che possono inviare mail
dig txt google.com +short

# Verifica della policy DMARC
# Permette di capire se il dominio ha impostato "reject", "quarantine" o "none"
dig txt _dmarc.microsoft.com +short
```

> **⚠️ Attenzione:** Molti attacchi moderni provengono da domini compromessi che hanno SPF e DKIM configurati correttamente. L'autenticazione da sola non è più una garanzia assoluta di sicurezza.

## Tecniche di offuscamento ed evasione

Gli attaccanti utilizzano strategie avanzate per nascondere la destinazione reale dei link e bypassare i sistemi di analisi automatizzata (Sandbox).

### 1. Attacchi Omografi (Punycode o Homograph Attack)
Sfruttano la somiglianza visiva tra caratteri di alfabeti diversi. Ad esempio, la "o" latina in `google.com` può essere sostituita con una "о" cirillica. Il browser interpreterà il dominio come `xn--ggle-46da.com`, ma l'utente vedrà un URL apparentemente legittimo.

Puoi utilizzare questo script Python per rilevare potenziali attacchi omografi e verificare la sicurezza del protocollo:

```Python
import urllib.parse
import idna

def analyze_phishing_url(url):
    """
    Analizza un URL per rilevare potenziali attacchi omografi (Punycode)
    o configurazioni di protocollo insicure.
    """
    try:
        parsed = urllib.parse.urlparse(url)
        domain = parsed.netloc
        
        print(f"\n--- Report Analisi URL ---")
        print(f"URL analizzato: {url}")
        print(f"Protocollo:     {parsed.scheme.upper()}")
        print(f"Dominio:        {domain}")
        
        # Rilevamento Punycode (Homograph Attack)
        if "xn--" in domain:
            decoded_domain = idna.decode(domain)
            print(f"⚠️  ALLERTA PUNYCODE: Il dominio reale visualizzato è: {decoded_domain}")
        else:
            print("✅ Il dominio non sembra utilizzare offuscamento Punycode.")
            
        # Verifica crittografia (HTTPS)
        if parsed.scheme != "https":
            print("⚠️  AVVISO: L'URL non utilizza HTTPS. La connessione è insicura.")
            
    except Exception as e:
        print(f"Errore durante l'analisi: {e}")

# Esempio di test con un dominio punycode
analyze_phishing_url("https://xn--pypal-4ve.com/login")
```

### 2. Redirect a catena

L'email punta a un URL legittimo (spesso un sito WordPress bucato) che contiene uno script di reindirizzamento verso la landing page finale. Questo "spezza" l'analisi automatizzata dei filtri.

### 3. Cloaking e Anti-Sandbox
I moderni kit di phishing includono script capaci di rilevare se il visitatore è un utente reale o un sistema di sicurezza:
* **IP Blacklisting:** Se l'IP appartiene a società di cybersecurity (es. Cisco, FireEye, Google), il sito mostra una pagina innocua.
* **Geofencing:** Il contenuto malevolo viene attivato solo se l'utente si connette da una specifica nazione.

## Esempio di Analisi Header

Puoi identificare un tentativo di spoofing analizzando i salti (hop) effettuati dall'email nel campo `Received`:

```bash
# Esempio di controllo record SPF via terminale
dig txt esempio-dominio-phishing.it
```

```Python
def check_header_discrepancy(envelope_from, header_from):
    """Semplice logica di controllo tra mittente reale e dichiarato"""
    if envelope_from != header_from:
        print("Alert: Possibile spoofing dell'header rilevato!")
        return True
    return False
```

## Strategie di difesa e contromisure

La difesa efficace combina strumenti tecnologici e abitudini di verifica rigorose.

### 1. Difesa lato utente

Prima di cliccare, è fondamentale eseguire tre controlli rapidi:

1. **Diffida dell'urgenza:** Messaggi che forzano un'azione immediata sono quasi sempre truffe.
2. **Verifica il mittente:** Controlla l'indirizzo email reale, non solo il nome visualizzato.
3. **Ispeziona i link:** Passa il mouse sopra un link (senza cliccare) per visualizzare l'URL di destinazione reale.

### 2. L'autenticazione a più fattori (MFA)

L'MFA è la misura più efficace: anche con la tua password, un attaccante non potrebbe accedere senza il secondo fattore. È preferibile usare app come **Bitwarden** o **Google Authenticator** rispetto agli SMS.

### 3. Cosa fare se hai abboccato

Se hai inserito i tuoi dati su un sito sospetto, la velocità di reazione è fondamentale:

1. **Cambio password immediato:** Modifica la password dell'account compromesso e attiva un Password Manager.
2. **Revoca delle sessioni:** Disconnetti tutti i dispositivi dalle impostazioni di sicurezza dell'account.
3. **Blocco finanziario:** Se hai fornito dati bancari, contatta immediatamente l'istituto per bloccare le carte.
4. **Verifica dei permessi:** Controlla che non siano stati aggiunti indirizzi email di recupero o deleghe non autorizzate.

## Conclusioni

Il phishing è una minaccia in continua evoluzione. Comprendere i protocolli tecnici (SPF/DKIM/DMARC) e mantenere un sano scetticismo sono le armi migliori per proteggere la propria identità digitale e i propri dati aziendali.

---

*Se vuoi approfondire questi temi, hai domande su questo o altri argomenti, entra nella nostra community Discord: <i class="fab fa-discord"></i><https://discord.gg/PE2q2jnNN6!>*