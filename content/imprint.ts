/**
 * Impressum & Datenschutz — Texte 1:1 aus design/design_handoff_loona_site/Loona Site V2.dc.html (Zeile 826–884).
 * Rechtstexte: Änderungen nur nach Prüfung (Quelle der Datenschutzerklärung: Datenschutz-Generator.de).
 */

export type Segment = string | { href: string; text: string };

export type ImprintBlock =
  | { h: string; size: number }
  | { p: string | Segment[] }
  | { box: string[] }
  | { credit: { href: string; text: string } };

export const IMPRINT = {
  kicker: 'IMPRESSUM & DATENSCHUTZ',
  title: 'Das Kleingedruckte.',
  owner: 'Loona! Designs — Björn Sellnau',
  address: ['Gardeschützenweg 59', '12203 Berlin, Deutschland'],
  email: 'info@loona-designs.de',
  notice:
    'Jede Nutzung dieser Daten zu Zwecken, die nicht dem Kontakt bezüglich der auf diesen Internetseiten präsentierten Inhalte dient — etwa Werbung, sowohl postalisch, telefonisch als auch elektronisch — ist hiermit strengstens untersagt.',
};

export const PRIVACY_SECTIONS: { id: string; blocks: ImprintBlock[] }[] = [
  {
    "id": "i-datenschutz",
    "blocks": [
      {
        "h": "Datenschutzerklärung",
        "size": 24
      },
      {
        "p": "Diese Datenschutzerklärung klärt Sie über die Art, den Umfang und Zweck der Verarbeitung von personenbezogenen Daten (nachfolgend kurz „Daten\") innerhalb unseres Onlineangebotes und der mit ihm verbundenen Webseiten, Funktionen und Inhalte sowie externen Onlinepräsenzen, wie z. B. unserer Social-Media-Profile, auf (nachfolgend gemeinsam „Onlineangebot\"). Im Hinblick auf die verwendeten Begrifflichkeiten, wie z. B. „Verarbeitung\" oder „Verantwortlicher\", verweisen wir auf die Definitionen im Art. 4 der Datenschutzgrundverordnung (DSGVO)."
      }
    ]
  },
  {
    "id": "i-verant",
    "blocks": [
      {
        "h": "Verantwortlicher",
        "size": 16
      },
      {
        "box": [
          "Björn Sellnau",
          "Gardeschützenweg 59",
          "12203 Berlin, Deutschland",
          "info (at) loona-designs.de"
        ]
      }
    ]
  },
  {
    "id": "i-daten",
    "blocks": [
      {
        "h": "Arten der verarbeiteten Daten",
        "size": 16
      },
      {
        "p": "Bestandsdaten (z. B. Namen, Adressen) · Kontaktdaten (z. B. E-Mail, Telefonnummern) · Inhaltsdaten (z. B. Texteingaben, Fotografien, Videos) · Nutzungsdaten (z. B. besuchte Webseiten, Interesse an Inhalten, Zugriffszeiten) · Meta-/Kommunikationsdaten (z. B. Geräte-Informationen, IP-Adressen)."
      },
      {
        "h": "Zweck der Verarbeitung",
        "size": 16
      },
      {
        "p": "Zurverfügungstellung des Onlineangebotes, seiner Funktionen und Inhalte · Beantwortung von Kontaktanfragen und Kommunikation mit Nutzern · Sicherheitsmaßnahmen · Reichweitenmessung/Marketing."
      },
      {
        "h": "Verwendete Begrifflichkeiten",
        "size": 16
      },
      {
        "p": "„Personenbezogene Daten\" sind alle Informationen, die sich auf eine identifizierte oder identifizierbare natürliche Person („betroffene Person\") beziehen; als identifizierbar gilt eine Person, die direkt oder indirekt — insbesondere mittels Zuordnung zu einer Kennung wie einem Namen, einer Kennnummer, Standortdaten oder einer Online-Kennung (z. B. Cookie) — identifiziert werden kann."
      },
      {
        "p": "„Verarbeitung\" ist jeder mit oder ohne Hilfe automatisierter Verfahren ausgeführte Vorgang im Zusammenhang mit personenbezogenen Daten — der Begriff reicht weit und umfasst praktisch jeden Umgang mit Daten. Als „Verantwortlicher\" wird die natürliche oder juristische Person bezeichnet, die allein oder gemeinsam mit anderen über Zwecke und Mittel der Verarbeitung entscheidet."
      },
      {
        "h": "Maßgebliche Rechtsgrundlagen",
        "size": 16
      },
      {
        "p": "Nach Maßgabe des Art. 13 DSGVO teilen wir Ihnen die Rechtsgrundlagen unserer Datenverarbeitungen mit. Sofern nicht genannt, gilt: Einwilligungen — Art. 6 Abs. 1 lit. a und Art. 7 DSGVO; Erfüllung unserer Leistungen, vertragliche Maßnahmen und Beantwortung von Anfragen — Art. 6 Abs. 1 lit. b DSGVO; rechtliche Verpflichtungen — Art. 6 Abs. 1 lit. c DSGVO; berechtigte Interessen — Art. 6 Abs. 1 lit. f DSGVO; lebenswichtige Interessen — Art. 6 Abs. 1 lit. d DSGVO."
      },
      {
        "h": "Sicherheitsmaßnahmen",
        "size": 16
      },
      {
        "p": "Wir bitten Sie, sich regelmäßig über den Inhalt dieser Datenschutzerklärung zu informieren. Wir passen sie an, sobald Änderungen der Datenverarbeitung dies erforderlich machen, und informieren Sie, sobald dadurch eine Mitwirkungshandlung (z. B. Einwilligung) oder eine individuelle Benachrichtigung erforderlich wird."
      },
      {
        "h": "Zusammenarbeit mit Auftragsverarbeitern und Dritten",
        "size": 16
      },
      {
        "p": "Eine Offenbarung von Daten gegenüber anderen Personen und Unternehmen (Auftragsverarbeitern oder Dritten) erfolgt nur auf Grundlage einer gesetzlichen Erlaubnis, Ihrer Einwilligung, einer rechtlichen Verpflichtung oder unserer berechtigten Interessen (z. B. Webhoster). Beauftragen wir Dritte auf Grundlage eines „Auftragsverarbeitungsvertrages\", geschieht dies gemäß Art. 28 DSGVO."
      },
      {
        "h": "Übermittlungen in Drittländer",
        "size": 16
      },
      {
        "p": "Eine Verarbeitung in Drittländern (außerhalb von EU/EWR) erfolgt nur zur Erfüllung (vor)vertraglicher Pflichten, auf Grundlage Ihrer Einwilligung, einer rechtlichen Verpflichtung oder unserer berechtigten Interessen — und nur beim Vorliegen der besonderen Voraussetzungen der Art. 44 ff. DSGVO, etwa besonderer Garantien oder anerkannter Standardvertragsklauseln."
      }
    ]
  },
  {
    "id": "i-rechte",
    "blocks": [
      {
        "h": "Rechte der betroffenen Personen",
        "size": 16
      },
      {
        "p": "Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung bzw. Vervollständigung (Art. 16 DSGVO), unverzügliche Löschung bzw. Einschränkung der Verarbeitung (Art. 17/18 DSGVO) sowie auf Datenübertragbarkeit (Art. 20 DSGVO). Ferner haben Sie gemäß Art. 77 DSGVO das Recht, Beschwerde bei der zuständigen Aufsichtsbehörde einzureichen."
      },
      {
        "h": "Widerrufs- und Widerspruchsrecht",
        "size": 16
      },
      {
        "p": "Sie haben das Recht, erteilte Einwilligungen gemäß Art. 7 Abs. 3 DSGVO mit Wirkung für die Zukunft zu widerrufen — und der künftigen Verarbeitung Ihrer Daten nach Maßgabe des Art. 21 DSGVO jederzeit zu widersprechen, insbesondere der Verarbeitung für Zwecke der Direktwerbung."
      }
    ]
  },
  {
    "id": "i-cookies",
    "blocks": [
      {
        "h": "Cookies und Widerspruchsrecht bei Direktwerbung",
        "size": 16
      },
      {
        "p": "Als „Cookies\" werden kleine Dateien bezeichnet, die auf Rechnern der Nutzer gespeichert werden. „Session-Cookies\" werden nach Verlassen des Angebots und Schließen des Browsers gelöscht; „permanente\" Cookies bleiben auch danach gespeichert. „Third-Party-Cookies\" stammen von anderen Anbietern als dem Betreiber. Wir können temporäre und permanente Cookies einsetzen und klären hierüber in dieser Erklärung auf."
      },
      {
        "p": [
          "Nutzer, die keine Cookies wünschen, können die entsprechende Option in den Systemeinstellungen ihres Browsers deaktivieren und gespeicherte Cookies dort löschen — der Ausschluss kann zu Funktionseinschränkungen führen. Ein genereller Widerspruch gegen Onlinemarketing-Cookies kann über ",
          {
            "href": "http://www.aboutads.info/choices/",
            "text": "aboutads.info/choices"
          },
          " (US) oder ",
          {
            "href": "http://www.youronlinechoices.com/",
            "text": "youronlinechoices.com"
          },
          " (EU) erklärt werden."
        ]
      }
    ]
  },
  {
    "id": "i-hosting",
    "blocks": [
      {
        "h": "Löschung von Daten",
        "size": 16
      },
      {
        "p": "Verarbeitete Daten werden nach Maßgabe der Art. 17 und 18 DSGVO gelöscht oder in ihrer Verarbeitung eingeschränkt, sobald sie für ihre Zweckbestimmung nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Nach gesetzlichen Vorgaben in Deutschland gilt die Aufbewahrung insbesondere für 10 Jahre gemäß §§ 147 Abs. 1 AO, 257 Abs. 1 Nr. 1 und 4, Abs. 4 HGB sowie 6 Jahre gemäß § 257 Abs. 1 Nr. 2 und 3, Abs. 4 HGB (Handelsbriefe)."
      },
      {
        "h": "Hosting",
        "size": 16
      },
      {
        "p": "Die in Anspruch genommenen Hosting-Leistungen dienen der Zurverfügungstellung von Infrastruktur- und Plattformdienstleistungen, Rechenkapazität, Speicherplatz und Datenbankdiensten, Sicherheitsleistungen sowie technischen Wartungsleistungen. Dabei verarbeiten wir bzw. unser Hostinganbieter Bestands-, Kontakt-, Inhalts-, Vertrags-, Nutzungs-, Meta- und Kommunikationsdaten auf Grundlage unserer berechtigten Interessen an einer effizienten und sicheren Zurverfügungstellung (Art. 6 Abs. 1 lit. f DSGVO i. V. m. Art. 28 DSGVO)."
      },
      {
        "h": "Erhebung von Zugriffsdaten und Logfiles",
        "size": 16
      },
      {
        "p": "Wir bzw. unser Hostinganbieter erheben auf Grundlage berechtigter Interessen (Art. 6 Abs. 1 lit. f DSGVO) Daten über jeden Zugriff auf den Server (Serverlogfiles): abgerufene Seite und Datei, Datum und Uhrzeit, übertragene Datenmenge, Meldung über erfolgreichen Abruf, Browsertyp und -version, Betriebssystem, Referrer-URL, IP-Adresse und anfragender Provider. Logfile-Informationen werden aus Sicherheitsgründen für maximal 7 Tage gespeichert und danach gelöscht; Daten, deren weitere Aufbewahrung zu Beweiszwecken erforderlich ist, sind bis zur endgültigen Klärung des Vorfalls ausgenommen."
      },
      {
        "credit": {
          "href": "https://datenschutz-generator.de",
          "text": "Erstellt mit Datenschutz-Generator.de von RA Dr. Thomas Schwenke"
        }
      }
    ]
  }
];
