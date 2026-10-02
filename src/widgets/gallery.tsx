import { GallerySlots } from '@/site/pages/detail';
import { useSite } from '@/site/settings/SiteProvider';
import { defineWidget, gallery } from './define';

function Gallery({ images }: { images?: Parameters<typeof GallerySlots>[0]['images'] }) {
  const { mob } = useSite();
  return <GallerySlots wide={320} small={200} cols2={mob ? '1fr' : '1fr 1fr'} labels={['Bild 1', 'Bild 2', 'Bild 3']} images={images} />;
}

export default defineWidget({
  id: 'gallery',
  label: 'Galerie',
  icon: '▦',
  group: 'Medien',
  description: '1 breites + 2 kleine Bilder, mit Lightbox.',
  fields: { images: gallery({ label: 'Bilder' }) },
  render: ({ images }) => <Gallery images={images} />,
});
