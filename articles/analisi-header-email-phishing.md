---
title: "Analisi degli Header Email: Guida Completa per Identificare il Phishing"
description: "Impara a leggere e analizzare gli header delle email per riconoscere tentativi di phishing, spoofing e altre minacce. Una guida tecnica dettagliata con esempi pratici."
date: 2025-02-15
author: "CybersecurityZen"
image: "assets/images/phishing-analysis.png"
categories: [
        "Security Awareness",
        "Threat Analysis"
        ]
tags: [
        "email headers",
        "phishing detection",
        "SPF",
        "DKIM",
        "DMARC",
        "email authentication",
        "threat analysis"
        ]
draft: true
featured: true
---

# Analisi degli Header Email: Guida Completa per Identificare il Phishing

> **Questo articolo fa parte di una serie sul phishing.** Se non l'hai ancora fatto, ti consiglio di leggere prima [Cos'è il Phishing: Tipologie e Difesa](/articles/cos-e-il-phishing-tipologie-e-difesa.html) per una panoramica introduttiva, e [Analisi Tecnica: Phishing, Spoofing ed Evasione](/articles/analisi-tecnica-phishing-spoofing-evasione.html) per comprendere le tecniche utilizzate dagli attaccanti.

Gli header delle email rappresentano il "DNA" di ogni messaggio di posta elettronica. Contengono informazioni cruciali sul percorso del messaggio, l'autenticità del mittente e numerosi metadati che possono rivelare tentativi di phishing, spoofing o altre attività malevole. In questa guida approfondita, esploreremo ogni campo degli header email e come utilizzarli per proteggere te stesso e la tua organizzazione.

## Cosa Sono gli Header Email?

Gli header email sono una sezione di metadati invisibile all'utente comune, posizionata all'inizio di ogni messaggio di posta elettronica. Mentre il destinatario vede solo il corpo del messaggio, i campi "Da", "A" e "Oggetto", gli header contengono decine di righe di informazioni tecniche che documentano l'intero viaggio del messaggio dal mittente al destinatario.

Ogni server di posta che elabora il messaggio aggiunge le proprie informazioni agli header, creando una traccia dettagliata che può essere analizzata per verificare l'autenticità del messaggio.

## Come Visualizzare gli Header Email

Prima di analizzare gli header, è necessario sapere come accedervi nei principali client di posta:

**Gmail**: Apri l'email → Clicca sui tre puntini verticali → "Mostra originale"

**Outlook (Web)**: Apri l'email → Clicca sui tre puntini → "Visualizza" → "Visualizza origine messaggio"

**Outlook (Desktop)**: Apri l'email → File → Proprietà → "Intestazioni Internet"

**Thunderbird**: Apri l'email → Visualizza → Sorgente del messaggio (Ctrl+U)

**Apple Mail**: Apri l'email → Visualizza → Messaggio → Intestazioni complete

---

## Anatomia Completa degli Header Email

### 1. Received (Il Campo Più Importante)

Il campo `Received` è probabilmente il più critico per l'analisi forense delle email. Ogni server di posta che gestisce il messaggio aggiunge una riga "Received" in cima agli header esistenti. Questo significa che **gli header Received vanno letti dal basso verso l'alto** per seguire il percorso cronologico del messaggio.

**Struttura tipica:**

```
Received: from mail-server.example.com (mail-server.example.com [93.184.216.34])
        by mx.recipient.com (Postfix)
        with ESMTPS id ABC123DEF456
        for <destinatario@recipient.com>;
        Sat, 15 Feb 2025 10:30:45 +0100 (CET)
```

**Elementi da analizzare:**

| Elemento | Descrizione | Cosa Verificare |
|----------|-------------|-----------------|
| `from` | Server mittente dichiarato | Deve corrispondere al dominio del mittente |
| `(hostname [IP])` | Hostname e IP reali | Verifica con reverse DNS lookup |
| `by` | Server ricevente | Il tuo server di posta |
| `with` | Protocollo utilizzato | ESMTPS indica connessione cifrata |
| `for` | Destinatario | Deve essere il tuo indirizzo |
| `timestamp` | Data e ora | Sequenza cronologica coerente |

**🚨 Red Flags da Cercare:**

- **IP che non corrisponde al dominio dichiarato**: Se l'email dichiara di provenire da `paypal.com` ma l'IP risolve a un server in un paese improbabile, è sospetto
- **Salti geografici illogici**: Un'email da una banca italiana che passa per server in Russia o Cina
- **Timestamp inconsistenti**: Date fuori sequenza o nel futuro
- **Hostname generici**: Server come `vps12345.cheaphosting.com` per email "aziendali"
- **Assenza di crittografia**: `with SMTP` invece di `with ESMTPS` per comunicazioni sensibili

**Esempio di Header Received Sospetto:**

```
Received: from smtp.paypal.com (unknown [185.234.xx.xx])
        by mail.attacker-server.ru
        with SMTP
```

Qui vediamo che il server dichiara di essere `smtp.paypal.com`, ma:

- L'IP reale è contrassegnato come "unknown"
- Passa attraverso un server russo
- Non usa connessione cifrata (SMTP semplice)

---

### 2. From (Mittente)

```
From: "Servizio Clienti PayPal" <security@paypal.com>
```

Il campo `From` mostra il mittente come appare al destinatario. È composto da due parti:

- **Display Name**: Il nome visualizzato ("Servizio Clienti PayPal")
- **Email Address**: L'indirizzo effettivo (<security@paypal.com>)

**🚨 Red Flags:**

- **Discrepanza nome/indirizzo**: `"Amazon Support" <support@amaz0n-security.com>`
- **Domini simili ma diversi** (typosquatting):
  - `paypa1.com` invece di `paypal.com`
  - `arnazon.com` invece di `amazon.com`
  - `microsoftonline-login.com` invece di `microsoft.com`
- **Domini gratuiti per comunicazioni aziendali**: `amazon.support@gmail.com`
- **Sottodomini ingannevoli**: `paypal.com.malicious-site.com`

**Importante**: Il campo `From` è facilmente falsificabile (spoofing). Non basare mai la verifica solo su questo campo.

---

### 3. Return-Path (Envelope Sender)

```
Return-Path: <bounce-handler@real-sender.com>
```

Il `Return-Path` indica dove vengono inviate le notifiche di mancata consegna (bounce). In email legittime, dovrebbe corrispondere al dominio del mittente.

**🚨 Red Flags:**

- **Dominio completamente diverso dal From**: Se `From` è `@paypal.com` ma `Return-Path` è `@random-server.xyz`
- **Indirizzi usa e getta**: Domini appena registrati o servizi temporanei
- **Assenza del campo**: Alcune email di phishing omettono questo campo

---

### 4. Reply-To

```
Reply-To: response@different-domain.com
```

Specifica dove verranno inviate le risposte. Nelle email legittime, solitamente corrisponde al mittente o a un indirizzo correlato.

**🚨 Red Flags:**

- **Dominio diverso dal mittente**: Email "da" una banca con reply-to su Gmail
- **Indirizzi generici sospetti**: `claims@gmail.com`, `support123@yahoo.com`
- **Tentativo di catturare risposte**: L'attaccante vuole che tu risponda a un indirizzo controllato da lui

---

### 5. Message-ID

```
Message-ID: <1234567890.123456.789@mail.legitimate-company.com>
```

Identificatore univoco del messaggio generato dal server di origine. Il dominio dopo la `@` dovrebbe corrispondere al server mittente.

**🚨 Red Flags:**

- **Dominio non correlato al mittente**: Message-ID con dominio diverso dall'organizzazione dichiarata
- **Formato anomalo**: ID troppo semplici o pattern non standard
- **ID duplicati**: Lo stesso Message-ID usato per email diverse (indica automazione malevola)

---

### 6. X-Originating-IP

```
X-Originating-IP: [192.168.1.100]
```

Alcuni provider (come Outlook/Hotmail) includono l'IP originale del mittente. Questo campo può rivelare la vera origine geografica del messaggio.

**Come Analizzarlo:**

1. Copia l'indirizzo IP
2. Usa servizi come `whatismyipaddress.com` o `ipinfo.io` per geolocalizzarlo
3. Confronta con la presunta origine del messaggio

**🚨 Red Flags:**

- **Localizzazione inaspettata**: Un'email dalla tua banca italiana originata da un IP nigeriano o cinese
- **IP di VPN/Tor noti**: Indica tentativi di anonimizzazione
- **IP residenziali per comunicazioni aziendali**: Le aziende usano IP statici aziendali

---

## Campi di Autenticazione Email

Questi campi sono fondamentali per verificare l'autenticità di un'email. Rappresentano i tre pilastri della sicurezza email moderna.

### 7. SPF (Sender Policy Framework)

```
Received-SPF: pass (google.com: domain of info@legitimate-company.com 
              designates 209.85.220.41 as permitted sender)
```

SPF verifica che il server che invia l'email sia autorizzato dal dominio del mittente. Il dominio pubblica un record DNS TXT che elenca i server autorizzati a inviare email per suo conto.

**Possibili risultati:**

| Risultato | Significato | Rischio |
|-----------|-------------|---------|
| `pass` | Server autorizzato | ✅ Basso |
| `fail` | Server NON autorizzato | 🚨 Alto - Probabile spoofing |
| `softfail` | Probabilmente non autorizzato | ⚠️ Medio - Sospetto |
| `neutral` | Nessuna policy definita | ⚠️ Medio - Inconcludente |
| `none` | Nessun record SPF | ⚠️ Medio - Configurazione mancante |
| `temperror` | Errore temporaneo DNS | Riprovare |
| `permerror` | Errore nella sintassi SPF | Configurazione errata |

**🚨 Red Flags:**

- **`fail` su email che dichiarano di provenire da grandi aziende**: Tutte le grandi aziende hanno SPF configurato
- **`none` per banche o istituzioni finanziarie**: Improbabile che non abbiano SPF

---

### 8. DKIM (DomainKeys Identified Mail)

```
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;
        d=legitimate-company.com; s=selector1;
        h=from:to:subject:date:message-id;
        bh=abc123...;
        b=xyz789...
```

DKIM aggiunge una firma crittografica all'email. Il server ricevente può verificare questa firma usando la chiave pubblica nel DNS del dominio mittente.

**Elementi chiave:**

| Parametro | Descrizione |
|-----------|-------------|
| `d=` | Dominio che ha firmato (deve corrispondere al From) |
| `s=` | Selettore per trovare la chiave pubblica |
| `h=` | Header inclusi nella firma |
| `b=` | La firma digitale effettiva |
| `bh=` | Hash del corpo del messaggio |

**Verifica DKIM (Authentication-Results):**

```
Authentication-Results: mx.google.com;
       dkim=pass header.d=legitimate-company.com
```

**🚨 Red Flags:**

- **`dkim=fail`**: La firma non è valida - il messaggio potrebbe essere stato modificato o è falsificato
- **Dominio `d=` diverso dal From**: Discrepanza tra chi firma e chi dichiara di inviare
- **Assenza di DKIM per grandi organizzazioni**: La maggior parte delle aziende serie usa DKIM

---

### 9. DMARC (Domain-based Message Authentication)

```
Authentication-Results: mx.google.com;
       dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=legitimate-company.com
```

DMARC unifica SPF e DKIM, definendo cosa fare con le email che falliscono i controlli.

**Policy DMARC:**

| Policy | Azione |
|--------|--------|
| `p=none` | Solo monitoraggio, nessun blocco |
| `p=quarantine` | Email sospette vanno in spam |
| `p=reject` | Email non autenticate rifiutate |

**🚨 Red Flags:**

- **`dmarc=fail` con email "importanti"**: Banche, PayPal, Amazon hanno tutti `p=reject`
- **Assenza di DMARC per istituzioni finanziarie**: Estremamente sospetto

---

### 10. Authentication-Results (Sommario)

Questo header riassume tutti i controlli di autenticazione:

```
Authentication-Results: mx.google.com;
       spf=pass (google.com: domain of info@company.com designates 
           209.85.220.41 as permitted sender) smtp.mailfrom=info@company.com;
       dkim=pass header.d=company.com header.s=selector1 header.b=abc123;
       dmarc=pass (p=REJECT sp=REJECT) header.from=company.com
```

**Email Legittima**: Tutti e tre `pass`
**Email Sospetta**: Uno o più `fail` o `softfail`

---

## Altri Header Importanti

### 11. X-Mailer / User-Agent

```
X-Mailer: Microsoft Outlook 16.0
User-Agent: Mozilla Thunderbird 102.0
```

Indica il software usato per comporre l'email.

**🚨 Red Flags:**

- **Script o bot**: `X-Mailer: PHPMailer 6.0.0` per "email personali"
- **Inconsistenze**: Email "da iPhone" con X-Mailer di Outlook
- **Versioni obsolete o inesistenti**: Software non più esistente

---

### 12. X-Priority / Importance

```
X-Priority: 1 (Highest)
Importance: High
```

Indica la priorità del messaggio.

**🚨 Red Flags:**

- **Priorità alta su email non sollecitate**: Tattica per creare urgenza
- **Combinato con oggetti allarmisti**: "URGENTE: Il tuo account sarà sospeso"

---

### 13. Content-Type

```
Content-Type: multipart/mixed; boundary="----=_Part_123456"
Content-Type: text/html; charset="UTF-8"
```

Specifica il formato del contenuto del messaggio.

**🚨 Red Flags:**

- **HTML nascosto in email "plain text"**: Potrebbe contenere link mascherati
- **Allegati sospetti**: `application/x-msdownload`, `.exe`, `.scr`, `.vbs`

---

### 14. X-Spam-Status e X-Spam-Score

```
X-Spam-Status: No, score=-2.0 required=5.0
X-Spam-Score: -2.0
```

Valutazione antispam del server ricevente. Score negativi indicano email più probabilmente legittime.

---

## Checklist Pratica di Analisi

Quando analizzi un'email sospetta, segui questa checklist:

### ✅ Verifica di Base

- [ ] Il dominio del mittente è scritto correttamente? (no typosquatting)
- [ ] From, Return-Path e Reply-To sono coerenti?
- [ ] Il Message-ID corrisponde al dominio mittente?

### ✅ Analisi del Percorso (Received Headers)

- [ ] Leggi i Received dal basso verso l'alto
- [ ] Gli IP corrispondono ai domini dichiarati?
- [ ] Il percorso geografico è logico?
- [ ] I timestamp sono in sequenza?
- [ ] È stata usata crittografia (ESMTPS)?

### ✅ Autenticazione

- [ ] SPF: pass?
- [ ] DKIM: pass con dominio corretto?
- [ ] DMARC: pass?
- [ ] Tutti e tre i controlli superati?

### ✅ Red Flags Generali

- [ ] Urgenza eccessiva nel messaggio?
- [ ] Richiesta di informazioni sensibili?
- [ ] Link che non corrispondono al testo visualizzato?
- [ ] Allegati non richiesti?
- [ ] Errori grammaticali o di formattazione?

---

## Strumenti Utili per l'Analisi

### Strumenti Online

1. **MXToolbox Header Analyzer** - `mxtoolbox.com/EmailHeaders.aspx`
   - Analisi completa e visualizzazione del percorso

2. **Google Admin Toolbox** - `toolbox.googleapps.com/apps/messageheader`
   - Ottimo per visualizzare il flusso temporale

3. **Mail Header Analyzer** - `mailheader.org`
   - Interfaccia semplice, analisi dettagliata

### Verifiche DNS

1. **SPF Record Check**: `dig TXT dominio.com` o `nslookup -type=TXT dominio.com`
2. **DKIM Record Check**: `dig TXT selector._domainkey.dominio.com`
3. **DMARC Record Check**: `dig TXT _dmarc.dominio.com`

### Verifica IP

1. **IPInfo.io**: Geolocalizzazione e informazioni sul provider
2. **AbuseIPDB**: Verifica se l'IP è stato segnalato per attività malevole
3. **VirusTotal**: Analisi di URL e IP sospetti

---

## Esempi Pratici

### Esempio 1: Email Legittima

```
Return-Path: <noreply@paypal.com>
Received: from mx1.paypal.com (mx1.paypal.com [66.211.168.123])
        by mx.gmail.com with ESMTPS
        for <utente@gmail.com>;
        Sat, 15 Feb 2025 10:00:00 -0800
From: "PayPal" <noreply@paypal.com>
Authentication-Results: mx.google.com;
       spf=pass (domain of paypal.com designates 66.211.168.123 as permitted)
       dkim=pass header.d=paypal.com
       dmarc=pass (p=REJECT)
Message-ID: <123456789@paypal.com>
```

**Analisi**: ✅ Tutti gli indicatori sono positivi. SPF, DKIM e DMARC passano. Gli IP e i domini sono coerenti.

### Esempio 2: Email di Phishing

```
Return-Path: <bounce@mail-server-xyz.ru>
Received: from smtp.paypal.com (unknown [185.234.72.xxx])
        by mail-server-xyz.ru with SMTP
        for <utente@gmail.com>;
        Sat, 15 Feb 2025 18:00:00 +0300
From: "PayPal Security Team" <security@paypa1-secure.com>
Reply-To: paypal.verify@gmail.com
Authentication-Results: mx.google.com;
       spf=fail
       dkim=none
       dmarc=fail
Message-ID: <random123@unknown-server.net>
```

**Analisi**: 🚨 Multipli red flags:

- Return-Path su dominio russo
- IP non corrisponde a PayPal
- Dominio "paypa1" con numero 1 invece di "l"
- Reply-To su Gmail (una banca non usa Gmail)
- SPF e DMARC falliti
- Nessuna firma DKIM
- Message-ID su server sconosciuto
- Connessione non cifrata (SMTP semplice)

---

## Conclusioni

L'analisi degli header email è una competenza fondamentale per chiunque voglia proteggersi dal phishing. Mentre i controlli automatici (SPF, DKIM, DMARC) filtrano molte minacce, comprendere come leggere gli header ti permette di identificare anche attacchi sofisticati che potrebbero eludere i filtri.

Ricorda sempre:

- **Non fidarti mai solo del campo "From"**: è facilmente falsificabile
- **Verifica sempre i tre pilastri**: SPF, DKIM e DMARC
- **Analizza il percorso**: i campi Received raccontano la vera storia
- **In caso di dubbio, non cliccare**: contatta direttamente l'organizzazione tramite canali ufficiali

La sicurezza email è una responsabilità condivisa. Più persone sanno riconoscere il phishing, più sicuro diventa l'ecosistema per tutti.

---

## Articoli Correlati

Questa guida fa parte di una serie completa sul phishing. Per approfondire l'argomento, consulta gli altri articoli:

1. **[Cos'è il Phishing: Tipologie e Difesa](/articles/cos-e-il-phishing-tipologie-e-difesa.html)** - Introduzione al fenomeno del phishing, le diverse tipologie di attacco e le strategie di difesa fondamentali.

2. **[Analisi Tecnica: Phishing, Spoofing ed Evasione](/articles/analisi-tecnica-phishing-spoofing-evasione.html)** - Approfondimento sulle tecniche utilizzate dagli attaccanti per falsificare l'identità del mittente e aggirare i sistemi di sicurezza.

3. **Analisi degli Header Email** *(questo articolo)* - Guida pratica all'analisi forense degli header per identificare email fraudolente.

---

*Ultimo aggiornamento: Febbraio 2025*
