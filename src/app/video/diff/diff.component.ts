import { Component, Input } from '@angular/core';
import { DecimalPipe, NgIf } from '@angular/common';
import { DiffPipe } from '../../pipes/diff.pipe';
import { AbsolutePipe } from '../../pipes/absolute.pipe';

@Component({
	selector: 'app-diff',
	standalone: true,
	imports: [
		NgIf,
		DiffPipe,
		DecimalPipe,
		AbsolutePipe,
	],
	templateUrl: './diff.component.html',
	styleUrl: './diff.component.scss',
})
export class DiffComponent {
	@Input()
	diff = NaN;
}
