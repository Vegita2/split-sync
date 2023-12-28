import { Pipe, PipeTransform } from '@angular/core';
import { Split } from '../video.component';

@Pipe({
	name: 'diff',
	standalone: true,
	pure: false
})
export class DiffPipe implements PipeTransform {

	transform(splits1: Split[], splits2: Split[], index: number): number {
		const v1 = splits1[index].timestamp - splits1[index - 1]?.timestamp;
		const v2 = splits2[index].timestamp - splits2[index - 1]?.timestamp;

		return v1 - v2;
	}

}
