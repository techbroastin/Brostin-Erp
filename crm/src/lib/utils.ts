import { createCn } from 'cn/config'

/**
 * Class-name merger. The project's typography scale (index.css --text-*)
 * adds custom font sizes like `text-caption`; without telling the merger
 * they are font sizes, it treats them as text colours and drops them when
 * a colour such as `text-success` follows (e.g. a small coloured pill
 * rendering at full size).
 */
export const cn = createCn({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display',
            'h1',
            'h2',
            'h3',
            'page-title',
            'section-title',
            'card-title',
            'body-lg',
            'body',
            'body-sm',
            'caption',
            'label',
            'table-header',
            'button',
          ],
        },
      ],
    },
  },
})
