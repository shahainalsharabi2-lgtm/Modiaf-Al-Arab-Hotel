import { Component } from '@angular/core';

/** صفحة فارغة لعناصر الشريط الجانبي التي لا يوج لها محتوى بعد */
@Component({
  selector: 'app-nav-placeholder',
  standalone: true,
  template: '',
  styles: [
    `
      :host {
        display: block;
        min-height: 1px;
      }
    `,
  ],
})
export class NavPlaceholderComponent {}
