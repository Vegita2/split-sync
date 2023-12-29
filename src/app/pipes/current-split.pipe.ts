import { Pipe, PipeTransform } from '@angular/core';
import { Split } from '../video/video.component';
import { NumberSymbol } from '@angular/common';

@Pipe({
	name: 'currentSplit',
	standalone: true,
})
export class CurrentSplitPipe implements PipeTransform {

	transform(splits: Split[], currTime: number): number {
		let bestIndex = 0;
		for (let i = 0; i < splits.length; i++) {
			const time = splits[i].timestamp;
			bestIndex = i;
			if (time > currTime) {
				break;
			}
		}
		return bestIndex;
	}

}
