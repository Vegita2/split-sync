import { Component, Input } from '@angular/core';
import { DecimalPipe, NgIf } from '@angular/common';
import { Split } from '../video.component';
import { DiffPipe } from './diff.pipe';

@Component({
	selector: 'app-diff',
	standalone: true,
	imports: [
		NgIf,
		DiffPipe,
		DecimalPipe,
	],
	templateUrl: './diff.component.html',
	styleUrl: './diff.component.scss',
})
export class DiffComponent {

	@Input()
	splits1: Split[] = [];

	@Input()
	splits2: Split[] = [];

	@Input()
	index = 0;
}
