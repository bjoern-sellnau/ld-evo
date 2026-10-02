import { EText } from '@/site/cms/editing';
import { ContactForm } from '@/site/widgets/ContactForm';
import { defineWidget, text, textarea } from './define';
import { LocalLink } from '@/site/i18n/LocalLink';
import { useT } from '@/site/i18n/LocaleProvider';

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
  render: function Contact({ submitLabel, success, notice, path, accent }) {
    // Leere Felder: Standardtexte in der Sprache der Seite.
    const t = useT();
    return (
      <ContactForm
        accent={accent}
        submitLabel={<EText path={`${path}.submitLabel`} value={submitLabel || t('form.submit')} />}
        success={<EText path={`${path}.success`} value={success || t('form.success')} multiline />}
        notice={
          <>
            <EText path={`${path}.notice`} value={notice || t('form.notice')} multiline />{' '}
            <LocalLink href="/impressum#i-datenschutz" style={{ color: 'inherit', textDecoration: 'underline' }}>
              {t('form.privacy')}
            </LocalLink>
          </>
        }
      />
    );
  },
});
