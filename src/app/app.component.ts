import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { Split, VideoComponent, VideoEvent } from './video/video.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subject } from 'rxjs';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [CommonModule, RouterOutlet, MatCardModule, MatInputModule, VideoComponent, MatButtonModule, MatSlideToggleModule],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
	@ViewChild('vid1') vid1!: VideoComponent;
	@ViewChild('vid2') vid2!: VideoComponent;


	sync = false;
	title = 'speedrun-timing-tool';

	events1 = new Subject<VideoEvent>();
	events2 = new Subject<VideoEvent>();

	currentSplit = -1;

	splits1: Split[] = [
		{ timestamp: 1498.649134 },
		{ timestamp: 1629.863775 },
		{ timestamp: 1679.474289 },
		{ timestamp: 1878.689890 },
		{ timestamp: 2038.429238 },
		{ timestamp: 2084.592541 },
		{ timestamp: 2216.542981 },
	];

	splits2: Split[] = [
		{ timestamp: 18.1606280 },
		{ timestamp: 149.221314 },
		{ timestamp: 196.911978 },
		{ timestamp: 392.569944 },
		{ timestamp: 554.925216 },
		{ timestamp: 602.423572 },
		{ timestamp: 735.444783 },
	];

	ngOnInit() {
		this.events1.subscribe(v => {
			switch (v) {
				case VideoEvent.PLAYED:
					this.playAll();
					break;
				case VideoEvent.PAUSED:
					this.pauseAll();
					break;
				case VideoEvent.SEEKED:
					this.currentSplit = -1;
					break;
			}
		});

		const sync = async () => {
			await this.syncVids(this.vid1, this.vid2);
			requestAnimationFrame(sync);
		};

		requestAnimationFrame(sync);
	}

	private async syncVids(v1: VideoComponent, v2: VideoComponent) {
		if (!this.sync) {
			this.currentSplit = -1;
			return;
		}
		const currTime = v1.currentSeconds();
		let bestIndex = 0;
		for (let i = 0; i < v1.splits.length; i++) {
			const time = v1.splits[i].timestamp;
			bestIndex = i;
			if (time > currTime) {
				break;
			}
		}
		if (bestIndex === this.currentSplit) {
			return;
		}
		this.currentSplit = bestIndex;

		if (bestIndex === 0) {
			return;
		}

		const splitDiff = currTime - v1.splits[bestIndex - 1].timestamp;

		const shouldPlay = v1.playing();

		if (shouldPlay) {
			v1.video.nativeElement.pause();
		}
		v2.video.nativeElement.currentTime = v2.splits[bestIndex - 1].timestamp + splitDiff;
		await new Promise(res => setTimeout(res, 600));
		if (shouldPlay) {
			await v1.video.nativeElement.play();
		}
	}

	private playAll() {
		if (!this.vid1.playing()) {
			this.vid1.video.nativeElement.play();
		}
		if (!this.vid2.playing()) {
			this.vid2.video.nativeElement.play();
		}
	}

	private pauseAll() {
		if (this.vid1.playing()) {
			this.vid1.video.nativeElement.pause();
		}
		if (this.vid2.playing()) {
			this.vid2.video.nativeElement.pause();
		}
	}
}
