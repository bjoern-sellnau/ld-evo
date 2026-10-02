/**
 * Impressum & Datenschutz — englische Fassung (Übersetzungsentwurf) von content/imprint.ts. Rechtlich maßgeblich
 * bleibt die deutsche Fassung. Gleiche Struktur/IDs; übersetzt sind nur Texte. Wird in LD Flow als ENTWURF angelegt
 * und erst nach Prüfung veröffentlicht.
 */

import type { ImprintBlock } from '../imprint';

export const IMPRINT: typeof import('../imprint').IMPRINT = {
  kicker: 'LEGAL NOTICE & PRIVACY',
  title: 'The fine print.',
  owner: 'Loona! Designs — Björn Sellnau',
  address: ['Gardeschützenweg 59', '12203 Berlin, Germany'],
  email: 'info@loona-designs.de',
  notice:
    'Any use of this data for purposes other than contact regarding the content presented on these web pages — such as advertising, whether by post, by telephone or electronically — is hereby strictly prohibited.',
};

export const PRIVACY_SECTIONS: { id: string; blocks: ImprintBlock[] }[] = [
  {
    "id": "i-datenschutz",
    "blocks": [
      {
        "h": "Privacy Policy",
        "size": 24
      },
      {
        "p": "This privacy policy informs you about the nature, scope and purpose of the processing of personal data (hereinafter “data”) within our online offering and the websites, functions and content connected with it, as well as external online presences such as our social media profiles (hereinafter collectively “online offering”). With regard to the terms used, such as “processing” or “controller”, we refer to the definitions in Art. 4 of the General Data Protection Regulation (GDPR)."
      }
    ]
  },
  {
    "id": "i-verant",
    "blocks": [
      {
        "h": "Controller",
        "size": 16
      },
      {
        "box": [
          "Björn Sellnau",
          "Gardeschützenweg 59",
          "12203 Berlin, Germany",
          "info (at) loona-designs.de"
        ]
      }
    ]
  },
  {
    "id": "i-daten",
    "blocks": [
      {
        "h": "Types of data processed",
        "size": 16
      },
      {
        "p": "Master data (e.g., names, addresses) · Contact data (e.g., email, telephone numbers) · Content data (e.g., text entries, photographs, videos) · Usage data (e.g., websites visited, interest in content, access times) · Meta/communication data (e.g., device information, IP addresses)."
      },
      {
        "h": "Purpose of processing",
        "size": 16
      },
      {
        "p": "Provision of the online offering, its functions and content · Responding to contact requests and communicating with users · Security measures · Reach measurement/marketing."
      },
      {
        "h": "Terms used",
        "size": 16
      },
      {
        "p": "“Personal data” means any information relating to an identified or identifiable natural person (“data subject”); an identifiable person is one who can be identified, directly or indirectly — in particular by reference to an identifier such as a name, an identification number, location data or an online identifier (e.g., a cookie)."
      },
      {
        "p": "“Processing” means any operation performed on personal data, whether or not by automated means — the term is broad and covers practically any handling of data. The “controller” is the natural or legal person who, alone or jointly with others, determines the purposes and means of the processing."
      },
      {
        "h": "Relevant legal bases",
        "size": 16
      },
      {
        "p": "In accordance with Art. 13 GDPR, we inform you of the legal bases of our data processing. Unless stated otherwise, the following applies: consent — Art. 6(1)(a) and Art. 7 GDPR; performance of our services, contractual measures and responding to inquiries — Art. 6(1)(b) GDPR; legal obligations — Art. 6(1)(c) GDPR; legitimate interests — Art. 6(1)(f) GDPR; vital interests — Art. 6(1)(d) GDPR."
      },
      {
        "h": "Security measures",
        "size": 16
      },
      {
        "p": "We ask you to regularly inform yourself about the content of this privacy policy. We will adapt it as soon as changes in data processing make this necessary, and will inform you as soon as this requires an act of cooperation on your part (e.g., consent) or an individual notification."
      },
      {
        "h": "Cooperation with processors and third parties",
        "size": 16
      },
      {
        "p": "Data is disclosed to other persons and companies (processors or third parties) only on the basis of a statutory permission, your consent, a legal obligation or our legitimate interests (e.g., web hosts). If we commission third parties on the basis of a “data processing agreement”, this is done in accordance with Art. 28 GDPR."
      },
      {
        "h": "Transfers to third countries",
        "size": 16
      },
      {
        "p": "Processing in third countries (outside the EU/EEA) takes place only to fulfill (pre-)contractual obligations, on the basis of your consent, a legal obligation or our legitimate interests — and only if the special requirements of Art. 44 et seq. GDPR are met, such as special safeguards or recognized standard contractual clauses."
      }
    ]
  },
  {
    "id": "i-rechte",
    "blocks": [
      {
        "h": "Rights of data subjects",
        "size": 16
      },
      {
        "p": "You have the right of access (Art. 15 GDPR), rectification or completion (Art. 16 GDPR), erasure without undue delay or restriction of processing (Art. 17/18 GDPR) and data portability (Art. 20 GDPR). Furthermore, pursuant to Art. 77 GDPR, you have the right to lodge a complaint with the competent supervisory authority."
      },
      {
        "h": "Right of withdrawal and right to object",
        "size": 16
      },
      {
        "p": "You have the right to withdraw consent given, pursuant to Art. 7(3) GDPR, with effect for the future — and to object at any time to the future processing of your data in accordance with Art. 21 GDPR, in particular to processing for direct marketing purposes."
      }
    ]
  },
  {
    "id": "i-cookies",
    "blocks": [
      {
        "h": "Cookies and right to object to direct marketing",
        "size": 16
      },
      {
        "p": "“Cookies” are small files that are stored on users’ computers. “Session cookies” are deleted after users leave the offering and close their browser; “permanent” cookies remain stored even afterwards. “Third-party cookies” come from providers other than the operator. We may use temporary and permanent cookies and explain this in this policy."
      },
      {
        "p": [
          "Users who do not want cookies can deactivate the corresponding option in their browser’s system settings and delete stored cookies there — excluding cookies may lead to functional limitations. A general objection to online marketing cookies can be declared via ",
          {
            "href": "http://www.aboutads.info/choices/",
            "text": "aboutads.info/choices"
          },
          " (US) or ",
          {
            "href": "http://www.youronlinechoices.com/",
            "text": "youronlinechoices.com"
          },
          " (EU)."
        ]
      }
    ]
  },
  {
    "id": "i-hosting",
    "blocks": [
      {
        "h": "Erasure of data",
        "size": 16
      },
      {
        "p": "Processed data is erased or its processing restricted in accordance with Art. 17 and 18 GDPR as soon as it is no longer required for its intended purpose and no statutory retention obligations prevent erasure. Under statutory requirements in Germany, retention applies in particular for 10 years pursuant to §§ 147(1) AO, 257(1) nos. 1 and 4, (4) HGB and for 6 years pursuant to § 257(1) nos. 2 and 3, (4) HGB (commercial letters)."
      },
      {
        "h": "Hosting",
        "size": 16
      },
      {
        "p": "The hosting services we use serve to provide infrastructure and platform services, computing capacity, storage space and database services, security services and technical maintenance services. In doing so, we or our hosting provider process master, contact, content, contract, usage, meta and communication data on the basis of our legitimate interests in an efficient and secure provision (Art. 6(1)(f) GDPR in conjunction with Art. 28 GDPR)."
      },
      {
        "h": "Collection of access data and log files",
        "size": 16
      },
      {
        "p": "On the basis of legitimate interests (Art. 6(1)(f) GDPR), we or our hosting provider collect data on every access to the server (server log files): page and file retrieved, date and time, amount of data transferred, notification of successful retrieval, browser type and version, operating system, referrer URL, IP address and requesting provider. For security reasons, log file information is stored for a maximum of 7 days and then deleted; data whose further retention is required for evidentiary purposes is exempt until the incident has been finally clarified."
      },
      {
        "credit": {
          "href": "https://datenschutz-generator.de",
          "text": "Created with Datenschutz-Generator.de by attorney Dr. Thomas Schwenke"
        }
      }
    ]
  }
];
