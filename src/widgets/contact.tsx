import { EText } from '@/site/cms/editing';
import { ContactForm } from '@/site/widgets/ContactForm';
import { defineWidget, text, textarea } from './define';

export default defineWidget({
  id: 'contact',
  label: 'Kontaktformular',
  icon: '✉',
  group: 'Aktion',
  description: 'Name, E-Mail, Nachricht — landet in LD Flow unter „Nachrichten“ (nicht im statischen Export).',
  fields: {
    submitLabel: text({ label: 'Button-Text', max: 40, inline: true }),
    success: textarea({ label: 'Danke-Text', max: 300, inline: true }),
    notice: textarea({ label: 'Datenschutz-Hinweis', max: 400, inline: true }),
  },
  render: ({ submitLabel, success, notice, path, accent }) => (
    <ContactForm
      accent={accent}
      submitLabel={<EText path={`${path}.submitLabel`} value={submitLabel || 'Nachricht senden'} />}
      success={<EText path={`${path}.success`} value={success || 'Danke! Ich melde mich so bald wie möglich.'} multiline />}
      notice={
        <>
          <EText
            path={`${path}.notice`}
            value={notice || 'Deine Angaben werden nur zur Beantwortung deiner Anfrage gespeichert.'}
            multiline
          />{' '}
          <a href="/impressum#i-datenschutz" style={{ color: 'inherit', textDecoration: 'underline' }}>
            Datenschutz
          </a>
        </>
      }
    />
  ),
});
