import {
  animate,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    query(
      ':enter',
      [style({ opacity: 0 }), animate('250ms ease-in', style({ opacity: 1 }))],
      { optional: true },
    ),
  ]),
]);
