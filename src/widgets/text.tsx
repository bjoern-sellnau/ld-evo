import { ERich } from '@/site/cms/editing';
import { defineWidget, richtext } from './define';

export default defineWidget({
  id: 'text',
  label: 'Text',
  icon: '¶',
  group: 'Text',
  description: 'Fließtext mit Überschriften, Listen, Zitaten und Links.',
  fields: { body: richtext({ label: 'Text', inline: true }) },
  render: ({ body, path }) => <ERich path={`${path}.body`} value={body} />,
});
