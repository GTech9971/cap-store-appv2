import type { Preview } from '@storybook/react-vite'

import '@ionic/react/css/core.css';
import { setupIonicReact } from '@ionic/react';
import { MemoryRouter } from 'react-router-dom';

setupIonicReact({
  mode: 'ios'
});

const preview: Preview = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    )
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;