import { VirtualKeyDef } from '../types';

export const KEYBOARD_LAYOUT: VirtualKeyDef[][] = [
  [
    { k: '`', shift: '~', f: 'finger-L-pinky' },
    { k: '1', shift: '!', f: 'finger-L-pinky' },
    { k: '2', shift: '@', f: 'finger-L-ring' },
    { k: '3', shift: '#', f: 'finger-L-middle' },
    { k: '4', shift: '$', f: 'finger-L-index' },
    { k: '5', shift: '%', f: 'finger-L-index' },
    { k: '6', shift: '^', f: 'finger-R-index' },
    { k: '7', shift: '&', f: 'finger-R-index' },
    { k: '8', shift: '*', f: 'finger-R-middle' },
    { k: '9', shift: '(', f: 'finger-R-ring' },
    { k: '0', shift: ')', f: 'finger-R-pinky' },
    { k: '-', shift: '_', f: 'finger-R-pinky' },
    { k: '=', shift: '+', f: 'finger-R-pinky' },
    { k: 'Backspace', label: 'BKSP', width: 'w-2', f: 'finger-R-pinky' }
  ],
  [
    { k: 'Tab', label: 'TAB', width: 'w-1_5', f: 'finger-L-pinky' },
    { k: 'q', f: 'finger-L-pinky' },
    { k: 'w', f: 'finger-L-ring' },
    { k: 'e', f: 'finger-L-middle' },
    { k: 'r', f: 'finger-L-index' },
    { k: 't', f: 'finger-L-index' },
    { k: 'y', f: 'finger-R-index' },
    { k: 'u', f: 'finger-R-index' },
    { k: 'i', f: 'finger-R-middle' },
    { k: 'o', f: 'finger-R-ring' },
    { k: 'p', f: 'finger-R-pinky' },
    { k: '[', shift: '{', f: 'finger-R-pinky' },
    { k: ']', shift: '}', f: 'finger-R-pinky' },
    { k: '\\', shift: '|', f: 'finger-R-pinky' }
  ],
  [
    { k: 'Caps', label: 'CAPS', width: 'w-1_5', f: 'finger-L-pinky' },
    { k: 'a', f: 'finger-L-pinky' },
    { k: 's', f: 'finger-L-ring' },
    { k: 'd', f: 'finger-L-middle' },
    { k: 'f', f: 'finger-L-index' },
    { k: 'g', f: 'finger-L-index' },
    { k: 'h', f: 'finger-R-index' },
    { k: 'j', f: 'finger-R-index' },
    { k: 'k', f: 'finger-R-middle' },
    { k: 'l', f: 'finger-R-ring' },
    { k: ';', shift: ':', f: 'finger-R-pinky' },
    { k: "'", shift: '"', f: 'finger-R-pinky' },
    { k: 'Enter', label: 'ENTER', width: 'w-2', f: 'finger-R-pinky' }
  ],
  [
    { k: 'ShiftLeft', label: 'SHIFT', width: 'w-2', f: 'finger-L-pinky' },
    { k: 'z', f: 'finger-L-pinky' },
    { k: 'x', f: 'finger-L-ring' },
    { k: 'c', f: 'finger-L-middle' },
    { k: 'v', f: 'finger-L-index' },
    { k: 'b', f: 'finger-L-index' },
    { k: 'n', f: 'finger-R-index' },
    { k: 'm', f: 'finger-R-index' },
    { k: ',', shift: '<', f: 'finger-R-middle' },
    { k: '.', shift: '>', f: 'finger-R-ring' },
    { k: '/', shift: '?', f: 'finger-R-pinky' },
    { k: 'ShiftRight', label: 'SHIFT', width: 'w-2', f: 'finger-R-pinky' }
  ],
  [
    { k: ' ', label: 'SPACE', width: 'w-space', f: 'finger-L-thumb' }
  ]
];
