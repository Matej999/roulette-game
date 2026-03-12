/* =========================================
   ROYAL ROULETTE – Game Logic
   ========================================= */

let bankValue = 1000;
let currentBet = 0;
let wager = 5;
let lastWager = 0;
let bet = [];
let numbersBet = [];
let previousNumbers = [];
let lastBetTarget = null;

// Statistics & new features
let gameStats = {
	totalSpins: 0,
	wins: 0,
	losses: 0,
	biggestWin: 0,
	currentStreak: 0,
	bestStreak: 0
};
let lastBetConfig = [];         // Saved bets for "Repeat" button
let betHistoryStack = [];       // Stack for "Undo" button
let numberFrequency = new Array(37).fill(0); // Hot/Cold tracking

let numRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
let wheelnumbersAC = [0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32];

let container = document.createElement('div');
container.setAttribute('id', 'container');
document.body.append(container);

loadStats();
startGame();
buildStatsPanel();
checkPendingDeposit();

let wheel = document.getElementsByClassName('wheel')[0];
let ballTrack = document.getElementsByClassName('ballTrack')[0];

/* ---------- STATS PERSISTENCE ---------- */

function saveStats() {
	try {
		localStorage.setItem('royalRouletteStats', JSON.stringify(gameStats));
		localStorage.setItem('royalRouletteFreq', JSON.stringify(numberFrequency));
		localStorage.setItem('royalRouletteBankValue', String(bankValue));
	} catch(e) {}
}

function loadStats() {
	try {
		const s = localStorage.getItem('royalRouletteStats');
		const f = localStorage.getItem('royalRouletteFreq');
		const b = localStorage.getItem('royalRouletteBankValue');
		if (s) gameStats = JSON.parse(s);
		if (f) numberFrequency = JSON.parse(f);
		if (b) bankValue = parseInt(b);
	} catch(e) {}
}

/* ---------- STATS PANEL ---------- */

function buildStatsPanel() {
	let old = document.getElementById('statsPanel');
	if (old) old.remove();

	let panel = document.createElement('div');
	panel.setAttribute('id', 'statsPanel');

	const items = [
		{ label: 'Spins gesamt', id: 'stat-spins',    val: gameStats.totalSpins },
		{ label: 'Gewonnen',     id: 'stat-wins',     val: gameStats.wins,      cls: 'positive' },
		{ label: 'Win Rate',     id: 'stat-winrate',  val: winRate() },
		{ label: 'Größter Gewinn', id: 'stat-biggest', val: gameStats.biggestWin.toLocaleString('de-DE') + ' €', cls: 'positive' },
		{ label: 'Aktuelle Serie', id: 'stat-streak', val: gameStats.currentStreak, cls: gameStats.currentStreak >= 0 ? 'positive' : 'negative' },
		{ label: 'Beste Serie',  id: 'stat-best',     val: gameStats.bestStreak, cls: 'positive' }
	];

	items.forEach(item => {
		let div = document.createElement('div');
		div.setAttribute('class', 'statItem');

		let lbl = document.createElement('span');
		lbl.setAttribute('class', 'statLabel');
		lbl.innerText = item.label;

		let val = document.createElement('span');
		val.setAttribute('id', item.id);
		val.setAttribute('class', 'statValue' + (item.cls ? ' ' + item.cls : ''));
		val.innerText = item.val;

		div.append(lbl, val);
		panel.append(div);
	});

	container.insertAdjacentElement('afterend', panel);

	// Add footer
	let foot = document.getElementById('game-footer');
	if (!foot) {
		foot = document.createElement('div');
		foot.setAttribute('id', 'game-footer');
		foot.innerText = '♠  Spiele verantwortungsbewusst  ♠';
		panel.insertAdjacentElement('afterend', foot);
	}
}

function updateStatsPanel() {
	let el;
	el = document.getElementById('stat-spins');    if (el) el.innerText = gameStats.totalSpins;
	el = document.getElementById('stat-wins');     if (el) el.innerText = gameStats.wins;
	el = document.getElementById('stat-winrate');  if (el) el.innerText = winRate();
	el = document.getElementById('stat-biggest');  if (el) el.innerText = gameStats.biggestWin.toLocaleString('de-DE') + ' €';
	el = document.getElementById('stat-streak');
	if (el) {
		el.innerText = gameStats.currentStreak;
		el.className = 'statValue ' + (gameStats.currentStreak >= 0 ? 'positive' : 'negative');
	}
	el = document.getElementById('stat-best');     if (el) el.innerText = gameStats.bestStreak;
}

function winRate() {
	if (gameStats.totalSpins === 0) return '0%';
	return Math.round(gameStats.wins / gameStats.totalSpins * 100) + '%';
}

/* ---------- GAME LIFECYCLE ---------- */

function resetGame() {
	bankValue = 1000;
	currentBet = 0;
	wager = 5;
	updateWagerLimits();
	bet = [];
	numbersBet = [];
	previousNumbers = [];
	lastBetConfig = [];
	betHistoryStack = [];
	document.getElementById('betting_board').remove();
	document.getElementById('notification').remove();
	buildBettingBoard();
	lastBetTarget = null;
	saveStats(); // persist reset bankValue
}

function startGame() {
	buildWheel();
	buildBettingBoard();
}

function gameOver() {
	let notification = document.createElement('div');
	notification.setAttribute('id', 'notification');

	let nSpan = document.createElement('span');
	nSpan.setAttribute('class', 'nSpan');
	nSpan.innerText = 'Bankrott! 💸';
	notification.append(nSpan);

	let subText = document.createElement('div');
	subText.style.cssText = 'position:relative;top:88px;text-align:center;font-size:16px;color:rgba(255,255,255,0.7);font-family:Inter,sans-serif;';
	subText.innerText = 'Gesamt: ' + gameStats.totalSpins + ' Spins · ' + gameStats.wins + ' Gewinne';
	notification.append(subText);

	let nBtn = document.createElement('div');
	nBtn.setAttribute('class', 'nBtn');
	nBtn.innerText = 'Nochmal spielen';
	nBtn.onclick = function () { resetGame(); };
	notification.append(nBtn);
	container.prepend(notification);
}

/* ---------- WHEEL CONSTRUCTION ---------- */

function buildWheel() {
	let wheel = document.createElement('div');
	wheel.setAttribute('class', 'wheel');

	let outerRim = document.createElement('div');
	outerRim.setAttribute('class', 'outerRim');
	wheel.append(outerRim);

	let numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
	for (let i = 0; i < numbers.length; i++) {
		let a = i + 1;
		let spanClass = (numbers[i] < 10) ? 'single' : 'double';
		let sect = document.createElement('div');
		sect.setAttribute('id', 'sect' + a);
		sect.setAttribute('class', 'sect');
		let span = document.createElement('span');
		span.setAttribute('class', spanClass);
		span.innerText = numbers[i];
		sect.append(span);
		let block = document.createElement('div');
		block.setAttribute('class', 'block');
		sect.append(block);
		wheel.append(sect);
	}

	let pocketsRim = document.createElement('div');
	pocketsRim.setAttribute('class', 'pocketsRim');
	wheel.append(pocketsRim);

	let ballTrack = document.createElement('div');
	ballTrack.setAttribute('class', 'ballTrack');
	let ball = document.createElement('div');
	ball.setAttribute('class', 'ball');
	ballTrack.append(ball);
	wheel.append(ballTrack);

	let pockets = document.createElement('div');
	pockets.setAttribute('class', 'pockets');
	wheel.append(pockets);

	let cone = document.createElement('div');
	cone.setAttribute('class', 'cone');
	wheel.append(cone);

	let turret = document.createElement('div');
	turret.setAttribute('class', 'turret');
	wheel.append(turret);

	let turretHandle = document.createElement('div');
	turretHandle.setAttribute('class', 'turretHandle');
	let thendOne = document.createElement('div');
	thendOne.setAttribute('class', 'thendOne');
	turretHandle.append(thendOne);
	let thendTwo = document.createElement('div');
	thendTwo.setAttribute('class', 'thendTwo');
	turretHandle.append(thendTwo);
	wheel.append(turretHandle);

	container.append(wheel);
}

/* ---------- BETTING BOARD CONSTRUCTION ---------- */

function buildBettingBoard() {
	let bettingBoard = document.createElement('div');
	bettingBoard.setAttribute('id', 'betting_board');

	let wl = document.createElement('div');
	wl.setAttribute('class', 'winning_lines');

	var wlttb = document.createElement('div');
	wlttb.setAttribute('id', 'wlttb_top');
	wlttb.setAttribute('class', 'wlttb');
	for (let i = 0; i < 11; i++) {
		let j = i;
		var ttbbetblock = document.createElement('div');
		ttbbetblock.setAttribute('class', 'ttbbetblock');
		var numA = (1 + (3 * j));
		var numB = (2 + (3 * j));
		var numC = (3 + (3 * j));
		var numD = (4 + (3 * j));
		var numE = (5 + (3 * j));
		var numF = (6 + (3 * j));
		let num = numA + ', ' + numB + ', ' + numC + ', ' + numD + ', ' + numE + ', ' + numF;
		var objType = 'double_street';
		ttbbetblock.onclick = function () { setBet(this, num, objType, 5); };
		ttbbetblock.oncontextmenu = function (e) { e.preventDefault(); removeBet(this, num, objType, 5); };
		wlttb.append(ttbbetblock);
	}
	wl.append(wlttb);

	for (let c = 1; c < 4; c++) {
		let d = c;
		var wlttb = document.createElement('div');
		wlttb.setAttribute('id', 'wlttb_' + c);
		wlttb.setAttribute('class', 'wlttb');
		for (let i = 0; i < 12; i++) {
			let j = i;
			var ttbbetblock = document.createElement('div');
			ttbbetblock.setAttribute('class', 'ttbbetblock');
			ttbbetblock.onclick = function () {
				if (d == 1 || d == 2) {
					var numA = ((2 - (d - 1)) + (3 * j));
					var numB = ((3 - (d - 1)) + (3 * j));
					var num = numA + ', ' + numB;
				} else {
					var numA = (1 + (3 * j));
					var numB = (2 + (3 * j));
					var numC = (3 + (3 * j));
					var num = numA + ', ' + numB + ', ' + numC;
				}
				var objType = (d == 3) ? 'street' : 'split';
				var odd = (d == 3) ? 11 : 17;
				setBet(this, num, objType, odd);
			};
			ttbbetblock.oncontextmenu = function (e) {
				e.preventDefault();
				if (d == 1 || d == 2) {
					var numA = ((2 - (d - 1)) + (3 * j));
					var numB = ((3 - (d - 1)) + (3 * j));
					var num = numA + ', ' + numB;
				} else {
					var numA = (1 + (3 * j));
					var numB = (2 + (3 * j));
					var numC = (3 + (3 * j));
					var num = numA + ', ' + numB + ', ' + numC;
				}
				var objType = (d == 3) ? 'street' : 'split';
				var odd = (d == 3) ? 11 : 17;
				removeBet(this, num, objType, odd);
			};
			wlttb.append(ttbbetblock);
		}
		wl.append(wlttb);
	}

	for (let c = 1; c < 12; c++) {
		let d = c;
		var wlrtl = document.createElement('div');
		wlrtl.setAttribute('id', 'wlrtl_' + c);
		wlrtl.setAttribute('class', 'wlrtl');
		for (let i = 1; i < 4; i++) {
			let j = i;
			var rtlbb = document.createElement('div');
			rtlbb.setAttribute('class', 'rtlbb' + i);
			var numA = (3 + (3 * (d - 1))) - (j - 1);
			var numB = (6 + (3 * (d - 1))) - (j - 1);
			let num = numA + ', ' + numB;
			rtlbb.onclick = function () { setBet(this, num, 'split', 17); };
			rtlbb.oncontextmenu = function (e) { e.preventDefault(); removeBet(this, num, 'split', 17); };
			wlrtl.append(rtlbb);
		}
		wl.append(wlrtl);
	}

	for (let c = 1; c < 3; c++) {
		var wlcb = document.createElement('div');
		wlcb.setAttribute('id', 'wlcb_' + c);
		wlcb.setAttribute('class', 'wlcb');
		for (let i = 1; i < 12; i++) {
			let count = (c == 1) ? i : i + 11;
			var cbbb = document.createElement('div');
			cbbb.setAttribute('id', 'cbbb_' + count);
			cbbb.setAttribute('class', 'cbbb');
			var numA = '2', numB = '3', numC = '5', numD = '6';
			let num = (count >= 1 && count < 12)
				? (parseInt(numA) + ((count - 1) * 3)) + ', ' + (parseInt(numB) + ((count - 1) * 3)) + ', ' + (parseInt(numC) + ((count - 1) * 3)) + ', ' + (parseInt(numD) + ((count - 1) * 3))
				: ((parseInt(numA) - 1) + ((count - 12) * 3)) + ', ' + ((parseInt(numB) - 1) + ((count - 12) * 3)) + ', ' + ((parseInt(numC) - 1) + ((count - 12) * 3)) + ', ' + ((parseInt(numD) - 1) + ((count - 12) * 3));
			var objType = 'corner_bet';
			cbbb.onclick = function () { setBet(this, num, objType, 8); };
			cbbb.oncontextmenu = function (e) { e.preventDefault(); removeBet(this, num, objType, 8); };
			wlcb.append(cbbb);
		}
		wl.append(wlcb);
	}

	bettingBoard.append(wl);

	// ---- 1-18 / 19-36 ----
	let bbtop = document.createElement('div');
	bbtop.setAttribute('class', 'bbtop');
	let bbtopBlocks = ['1 bis 18', '19 bis 36'];
	for (let i = 0; i < bbtopBlocks.length; i++) {
		let f = i;
		var bbtoptwo = document.createElement('div');
		bbtoptwo.setAttribute('class', 'bbtoptwo');
		let num = (f == 0) ? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18' : '19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36';
		var objType = (f == 0) ? 'outside_low' : 'outside_high';
		bbtoptwo.onclick = function () { setBet(this, num, objType, 1); };
		bbtoptwo.oncontextmenu = function (e) { e.preventDefault(); removeBet(this, num, objType, 1); };
		bbtoptwo.innerText = bbtopBlocks[i];
		bbtop.append(bbtoptwo);
	}
	bettingBoard.append(bbtop);

	// ---- NUMBER GRID ----
	let numberBoard = document.createElement('div');
	numberBoard.setAttribute('class', 'number_board');

	let zero = document.createElement('div');
	zero.setAttribute('class', 'number_0');
	zero.onclick = function () { setBet(this, '0', 'zero', 35); };
	zero.oncontextmenu = function (e) { e.preventDefault(); removeBet(this, '0', 'zero', 35); };
	let nbnz = document.createElement('div');
	nbnz.setAttribute('class', 'nbn');
	nbnz.innerText = '0';
	zero.append(nbnz);
	numberBoard.append(zero);

	var numberBlocks = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, '2 to 1', 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, '2 to 1', 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, '2 to 1'];
	var redBlocks = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
	for (let i = 0; i < numberBlocks.length; i++) {
		let a = i;
		var nbClass = (numberBlocks[i] == '2 to 1') ? 'tt1_block' : 'number_block';
		var colourClass = (redBlocks.includes(numberBlocks[i])) ? ' redNum' : ((nbClass == 'number_block') ? ' blackNum' : '');
		var numberBlock = document.createElement('div');
		numberBlock.setAttribute('class', nbClass + colourClass);
		numberBlock.onclick = function () {
			if (numberBlocks[a] != '2 to 1') {
				setBet(this, '' + numberBlocks[a] + '', 'inside_whole', 35);
			} else {
				let num = (a == 12) ? '3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36' : ((a == 25) ? '2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35' : '1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34');
				setBet(this, num, 'outside_column', 2);
			}
		};
		numberBlock.oncontextmenu = function (e) {
			e.preventDefault();
			if (numberBlocks[a] != '2 to 1') {
				removeBet(this, '' + numberBlocks[a] + '', 'inside_whole', 35);
			} else {
				let num = (a == 12) ? '3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36' : ((a == 25) ? '2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35' : '1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34');
				removeBet(this, num, 'outside_column', 2);
			}
		};
		var nbn = document.createElement('div');
		nbn.setAttribute('class', 'nbn');
		nbn.innerText = numberBlocks[i];
		numberBlock.append(nbn);
		numberBoard.append(numberBlock);
	}
	bettingBoard.append(numberBoard);

	// ---- DOZEN BETS ----
	let bo3Board = document.createElement('div');
	bo3Board.setAttribute('class', 'bo3_board');
	let bo3Blocks = ['1 bis 12', '13 bis 24', '25 bis 36'];
	for (let i = 0; i < bo3Blocks.length; i++) {
		let b = i;
		var bo3Block = document.createElement('div');
		bo3Block.setAttribute('class', 'bo3_block');
		bo3Block.onclick = function () {
			let num = (b == 0) ? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12' : ((b == 1) ? '13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24' : '25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36');
			setBet(this, num, 'outside_dozen', 2);
		};
		bo3Block.oncontextmenu = function (e) {
			e.preventDefault();
			let num = (b == 0) ? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12' : ((b == 1) ? '13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24' : '25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36');
			removeBet(this, num, 'outside_dozen', 2);
		};
		bo3Block.innerText = bo3Blocks[i];
		bo3Board.append(bo3Block);
	}
	bettingBoard.append(bo3Board);

	// ---- EVEN/ODD/RED/BLACK ----
	let otoBoard = document.createElement('div');
	otoBoard.setAttribute('class', 'oto_board');
	let otoBlocks = ['GERADE', 'ROT', 'SCHWARZ', 'UNGERADE'];
	for (let i = 0; i < otoBlocks.length; i++) {
		let d = i;
		var colourClass = (otoBlocks[i] == 'ROT') ? ' redNum' : ((otoBlocks[i] == 'SCHWARZ') ? ' blackNum' : '');
		var otoBlock = document.createElement('div');
		otoBlock.setAttribute('class', 'oto_block' + colourClass);
		otoBlock.onclick = function () {
			let num = (d == 0) ? '2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36'
				: ((d == 1) ? '1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36'
					: ((d == 2) ? '2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35'
						: '1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35'));
			setBet(this, num, 'outside_oerb', 1);
		};
		otoBlock.oncontextmenu = function (e) {
			e.preventDefault();
			let num = (d == 0) ? '2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36'
				: ((d == 1) ? '1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36'
					: ((d == 2) ? '2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35'
						: '1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35'));
			removeBet(this, num, 'outside_oerb', 1);
		};
		otoBlock.innerText = otoBlocks[i];
		otoBoard.append(otoBlock);
	}
	bettingBoard.append(otoBoard);

	// ---- CHIP DECK ----
	let chipDeck = document.createElement('div');
	chipDeck.setAttribute('class', 'chipDeck');
	let chipValues = [1, 5, 10, 100, 'clear'];
	for (let i = 0; i < chipValues.length; i++) {
		let cvi = i;
		let chipColour = (i == 0) ? 'red' : ((i == 1) ? 'blue cdChipActive' : ((i == 2) ? 'orange' : ((i == 3) ? 'gold' : 'clearBet')));
		let chip = document.createElement('div');
		chip.setAttribute('class', 'cdChip ' + chipColour);
		chip.onclick = function () {
			if (cvi !== 4) {
				let active = document.getElementsByClassName('cdChipActive');
				for (let k = 0; k < active.length; k++) active[k].classList.remove('cdChipActive');
				let curClass = this.getAttribute('class');
				if (!curClass.includes('cdChipActive')) this.setAttribute('class', curClass + ' cdChipActive');
				wager = parseInt(chip.childNodes[0].innerText);
			} else {
				bankValue = bankValue + currentBet;
				currentBet = 0;
				document.getElementById('bankSpan').innerText = bankValue.toLocaleString('de-DE');
				document.getElementById('betSpan').innerText = currentBet.toLocaleString('de-DE');
				clearBet();
				removeChips();
				betHistoryStack = [];
				refreshActionButtons();
			}
		};
		let chipSpan = document.createElement('span');
		chipSpan.setAttribute('class', 'cdChipSpan');
		chipSpan.innerText = chipValues[i];
		chip.append(chipSpan);
		chipDeck.append(chip);
	}
	bettingBoard.append(chipDeck);

	// ---- WAGER CONTROLS ----
	let wagerControls = document.createElement('div');
	wagerControls.setAttribute('class', 'wagerControls');

	let wagerLabel = document.createElement('div');
	wagerLabel.setAttribute('class', 'wagerLabel');
	wagerLabel.innerText = 'Individueller Einsatz';
	wagerControls.append(wagerLabel);

	let sliderContainer = document.createElement('div');
	sliderContainer.setAttribute('class', 'sliderContainer');

	let wagerSlider = document.createElement('input');
	wagerSlider.setAttribute('type', 'range');
	wagerSlider.setAttribute('id', 'wagerSlider');
	wagerSlider.setAttribute('min', '1');
	wagerSlider.setAttribute('max', bankValue);
	wagerSlider.setAttribute('value', wager);
	wagerSlider.setAttribute('class', 'wagerSlider');

	let wagerInput = document.createElement('input');
	wagerInput.setAttribute('type', 'number');
	wagerInput.setAttribute('id', 'wagerInput');
	wagerInput.setAttribute('min', '1');
	wagerInput.setAttribute('max', bankValue);
	wagerInput.setAttribute('value', wager);
	wagerInput.setAttribute('class', 'wagerInput');
	wagerInput.setAttribute('placeholder', 'Betrag');

	wagerSlider.addEventListener('input', function () {
		let v = parseInt(this.value);
		if (v >= 1 && v <= bankValue) {
			wager = v;
			wagerInput.value = v;
			clearActiveChips();
			updateCurrentWagerDisplay();
		}
	});

	wagerInput.addEventListener('input', function () {
		let v = parseInt(this.value);
		if (v >= 1 && v <= bankValue) {
			wager = v;
			wagerSlider.value = v;
			clearActiveChips();
		} else if (v > bankValue) {
			this.value = bankValue;
			wager = bankValue;
			wagerSlider.value = bankValue;
		} else if (v < 1 || isNaN(v)) {
			this.value = 1;
			wager = 1;
			wagerSlider.value = 1;
		}
		updateCurrentWagerDisplay();
	});

	let currentWagerDisplay = document.createElement('div');
	currentWagerDisplay.setAttribute('class', 'currentWagerDisplay');
	currentWagerDisplay.innerText = 'Einsatz: ' + wager + ' €';

	let maxButton = document.createElement('button');
	maxButton.setAttribute('class', 'maxButton');
	maxButton.innerText = 'MAX';
	maxButton.onclick = function () {
		wager = bankValue;
		let s = document.getElementById('wagerSlider');
		let inp = document.getElementById('wagerInput');
		if (s) s.value = bankValue;
		if (inp) inp.value = bankValue;
		clearActiveChips();
		updateCurrentWagerDisplay();
	};

	sliderContainer.append(wagerSlider, wagerInput, maxButton);
	wagerControls.append(sliderContainer, currentWagerDisplay);
	bettingBoard.append(wagerControls);

	// ---- ACTION BUTTONS ----
	let actionButtons = document.createElement('div');
	actionButtons.setAttribute('class', 'actionButtons');

	let undoBtn = document.createElement('button');
	undoBtn.setAttribute('class', 'actionBtn');
	undoBtn.setAttribute('id', 'undoBtn');
	undoBtn.innerText = '↩ Undo';
	undoBtn.disabled = true;
	undoBtn.onclick = function () { undoLastBet(); };

	let doubleBtn = document.createElement('button');
	doubleBtn.setAttribute('class', 'actionBtn');
	doubleBtn.setAttribute('id', 'doubleBtn');
	doubleBtn.innerText = '×2 Doppeln';
	doubleBtn.disabled = true;
	doubleBtn.onclick = function () { doubleAllBets(); };

	let repeatBtn = document.createElement('button');
	repeatBtn.setAttribute('class', 'actionBtn');
	repeatBtn.setAttribute('id', 'repeatBtn');
	repeatBtn.innerText = '↻ Wiederholen';
	repeatBtn.disabled = true;
	repeatBtn.onclick = function () { repeatLastBet(); };

	actionButtons.append(undoBtn, doubleBtn, repeatBtn);
	bettingBoard.append(actionButtons);

	// ---- AUTO SPIN ----
	let autoSpinControls = document.createElement('div');
	autoSpinControls.setAttribute('class', 'autoSpinControls');

	let autoSpinLabel = document.createElement('div');
	autoSpinLabel.setAttribute('class', 'autoSpinLabel');
	autoSpinLabel.innerText = '⚙ Auto Spin Modus';
	autoSpinControls.append(autoSpinLabel);

	let autoSpinContainer = document.createElement('div');
	autoSpinContainer.setAttribute('class', 'autoSpinContainer');

	let targetNumberInput = document.createElement('input');
	targetNumberInput.setAttribute('type', 'number');
	targetNumberInput.setAttribute('id', 'targetNumber');
	targetNumberInput.setAttribute('min', '0');
	targetNumberInput.setAttribute('max', '36');
	targetNumberInput.setAttribute('value', '0');
	targetNumberInput.setAttribute('class', 'autoSpinInput');
	targetNumberInput.setAttribute('placeholder', 'Ziel (0-36)');

	let betAmountInput = document.createElement('input');
	betAmountInput.setAttribute('type', 'number');
	betAmountInput.setAttribute('id', 'betAmount');
	betAmountInput.setAttribute('min', '1');
	betAmountInput.setAttribute('value', '1000000');
	betAmountInput.setAttribute('class', 'autoSpinInput');
	betAmountInput.setAttribute('placeholder', 'Einsatz');

	let autoSpinStartButton = document.createElement('button');
	autoSpinStartButton.setAttribute('id', 'autoSpinStartButton');
	autoSpinStartButton.setAttribute('class', 'autoSpinButton');
	autoSpinStartButton.innerText = 'START';

	let autoSpinStopButton = document.createElement('button');
	autoSpinStopButton.setAttribute('id', 'autoSpinStopButton');
	autoSpinStopButton.setAttribute('class', 'autoSpinButton');
	autoSpinStopButton.innerText = 'STOP';
	autoSpinStopButton.disabled = true;

	autoSpinContainer.append(targetNumberInput, betAmountInput, autoSpinStartButton, autoSpinStopButton);
	autoSpinControls.append(autoSpinContainer);

	let autoSpinStatus = document.createElement('div');
	autoSpinStatus.setAttribute('class', 'autoSpinStatus');
	autoSpinStatus.innerText = 'Bereit';
	autoSpinControls.append(autoSpinStatus);

	bettingBoard.append(autoSpinControls);

	// ---- BANK / BET DISPLAY ----
	let bankContainer = document.createElement('div');
	bankContainer.setAttribute('class', 'bankContainer');

	let bankDiv = document.createElement('div');
	bankDiv.setAttribute('class', 'bank');
	let bankSpan = document.createElement('span');
	bankSpan.setAttribute('id', 'bankSpan');
	bankSpan.innerText = bankValue.toLocaleString('de-DE');
	bankDiv.append(bankSpan);
	bankContainer.append(bankDiv);

	let betDiv = document.createElement('div');
	betDiv.setAttribute('class', 'bet');
	let betSpan = document.createElement('span');
	betSpan.setAttribute('id', 'betSpan');
	betSpan.innerText = currentBet.toLocaleString('de-DE');
	betDiv.append(betSpan);
	bankContainer.append(betDiv);
	bettingBoard.append(bankContainer);

	// ---- PREVIOUS NUMBERS ----
	let pnBlock = document.createElement('div');
	pnBlock.setAttribute('class', 'pnBlock');
	let pnContent = document.createElement('div');
	pnContent.setAttribute('id', 'pnContent');
	pnContent.onwheel = function (e) {
		e.preventDefault();
		pnContent.scrollLeft += e.deltaY;
	};
	pnBlock.append(pnContent);
	bettingBoard.append(pnBlock);

	container.append(bettingBoard);

	// ---- QUOTE BOXES ----
	let quotes = [
		'"Vertrauen Sie Ihrem Glück!"',
		'"Heute ist Ihr Tag!"',
		'"Wer nicht wagt, der nicht gewinnt!"',
		'"Das Glück lächelt den Mutigen!"',
		'"Noch ein Dreh zum Jackpot!"',
		'"Das große Glück wartet!"',
		'"Jeder Einsatz zählt!"',
		'"Träumen Sie groß – gewinnen Sie größer!"',
		'"Heute schreiben Sie Geschichte!"',
		'"Gewinne entstehen im Kopf!"',
		'"Nur wer spielt, kann gewinnen!"',
		'"Der Jackpot wartet auf Sie!"',
		'"Jeder Dreh ist ein Abenteuer!"',
		'"Auf Ihr Glück!"',
		'"Nur ein Dreh zum König!"',
		'"Das Schicksal dreht sich für Sie!"'
	];

	function createQuoteBox(side) {
		let quoteBox = document.createElement('div');
		quoteBox.setAttribute('class', side === 'left' ? 'quoteLeft' : 'quoteRight');
		quoteBox.innerText = quotes[Math.floor(Math.random() * quotes.length)];
		document.body.appendChild(quoteBox);
		setInterval(() => {
			quoteBox.style.opacity = '0';
			setTimeout(() => {
				quoteBox.innerText = quotes[Math.floor(Math.random() * quotes.length)];
				quoteBox.style.opacity = '1';
			}, 600);
		}, 10000);
	}
	createQuoteBox('left');
	createQuoteBox('right');

	document.getElementById('autoSpinStartButton').addEventListener('click', function () {
		startAutoSpin();
		this.disabled = true;
		document.getElementById('autoSpinStopButton').disabled = false;
	});

	document.getElementById('autoSpinStopButton').addEventListener('click', function () {
		stopAutoSpin();
		this.disabled = true;
		document.getElementById('autoSpinStartButton').disabled = false;
	});

	// Refresh hot/cold display
	if (gameStats.totalSpins >= 5) updateHotColdNumbers();
}

/* ---------- HELPER FUNCTIONS ---------- */

function clearActiveChips() {
	let active = document.getElementsByClassName('cdChipActive');
	for (let k = 0; k < active.length; k++) active[k].classList.remove('cdChipActive');
}

function updateCurrentWagerDisplay() {
	let d = document.querySelector('.currentWagerDisplay');
	if (d) d.innerText = 'Einsatz: ' + wager.toLocaleString('de-DE') + ' €';
}

function refreshActionButtons() {
	let undoBtn = document.getElementById('undoBtn');
	let doubleBtn = document.getElementById('doubleBtn');
	let repeatBtn = document.getElementById('repeatBtn');
	if (undoBtn)  undoBtn.disabled  = betHistoryStack.length === 0;
	if (doubleBtn) doubleBtn.disabled = bet.length === 0;
	if (repeatBtn) repeatBtn.disabled = lastBetConfig.length === 0;
}

/* ---------- BET PLACEMENT ---------- */

function setBet(e, n, t, o) {
	lastWager = wager;
	if (wager > bankValue) wager = bankValue;
	if (wager <= 0) return;

	if (!container.querySelector('.spinBtn')) {
		let spinBtn = document.createElement('div');
		spinBtn.setAttribute('class', 'spinBtn');
		spinBtn.innerText = 'SPIN';
		spinBtn.onclick = function () {
			this.remove();
			spin();
		};
		container.append(spinBtn);
	}

	bankValue -= wager;
	currentBet += wager;
	document.getElementById('bankSpan').innerText = bankValue.toLocaleString('de-DE');
	document.getElementById('betSpan').innerText = currentBet.toLocaleString('de-DE');

	let currentNumbers = n;
	let currentType = t;
	let currentOdds = o;

	// Push to undo history
	betHistoryStack.push({ el: e, numbers: currentNumbers, type: currentType, odds: currentOdds, amount: wager });
	if (betHistoryStack.length > 60) betHistoryStack.shift();

	// Update existing bet on same field
	for (let i = 0; i < bet.length; i++) {
		if (bet[i].numbers == currentNumbers && bet[i].type == currentType) {
			existingBet = bet[i];
			bet[i].amt += wager;
			let chipColour = chipColor(bet[i].amt);
			if (e.querySelector('.chip')) {
				e.querySelector('.chip').setAttribute('class', 'chip ' + chipColour);
				e.querySelector('.chipSpan').innerText = bet[i].amt;
			}
			updateWagerLimits();
			refreshActionButtons();
			return;
		}
	}

	// New bet
	bet.push({ amt: wager, type: currentType, odds: currentOdds, numbers: currentNumbers, el: e });

	let numArray = currentNumbers.split(',').map(s => parseInt(s.trim()));
	for (let i = 0; i < numArray.length; i++) {
		if (!numbersBet.includes(numArray[i])) numbersBet.push(numArray[i]);
	}

	if (!e.querySelector('.chip')) {
		let chip = document.createElement('div');
		chip.setAttribute('class', 'chip ' + chipColor(wager));
		let chipSpan = document.createElement('span');
		chipSpan.setAttribute('class', 'chipSpan');
		chipSpan.innerText = wager;
		chip.append(chipSpan);
		e.append(chip);
	}

	updateWagerLimits();
	refreshActionButtons();
}

function chipColor(amt) {
	return (amt < 5) ? 'red' : ((amt < 10) ? 'blue' : ((amt < 100) ? 'orange' : 'gold'));
}

function removeBet(e, n, t, _o) {
	wager = (wager == 0) ? 100 : wager;
	for (let i = 0; i < bet.length; i++) {
		if (bet[i].numbers == n && bet[i].type == t) {
			if (bet[i].amt != 0) {
				let removeAmt = (bet[i].amt > wager) ? wager : bet[i].amt;
				bet[i].amt -= removeAmt;
				bankValue += removeAmt;
				currentBet -= removeAmt;
				document.getElementById('bankSpan').innerText = bankValue.toLocaleString('de-DE');
				document.getElementById('betSpan').innerText = currentBet.toLocaleString('de-DE');
				if (bet[i].amt == 0) {
					if (e.querySelector('.chip')) e.querySelector('.chip').style.cssText = 'display:none';
				} else {
					if (e.querySelector('.chip')) {
						e.querySelector('.chip').setAttribute('class', 'chip ' + chipColor(bet[i].amt));
						e.querySelector('.chipSpan').innerText = bet[i].amt;
					}
				}
			}
		}
	}
	if (currentBet == 0 && container.querySelector('.spinBtn')) {
		document.getElementsByClassName('spinBtn')[0].remove();
	}
}

/* ---------- UNDO / DOUBLE / REPEAT ---------- */

function undoLastBet() {
	if (betHistoryStack.length === 0) return;

	let last = betHistoryStack.pop();

	for (let i = 0; i < bet.length; i++) {
		if (bet[i].numbers == last.numbers && bet[i].type == last.type) {
			bet[i].amt -= last.amount;
			bankValue += last.amount;
			currentBet -= last.amount;
			document.getElementById('bankSpan').innerText = bankValue.toLocaleString('de-DE');
			document.getElementById('betSpan').innerText = currentBet.toLocaleString('de-DE');

			if (bet[i].amt <= 0) {
				bet.splice(i, 1);
				if (last.el && last.el.querySelector('.chip')) {
					last.el.querySelector('.chip').style.cssText = 'display:none';
				}
			} else {
				if (last.el && last.el.querySelector('.chip')) {
					last.el.querySelector('.chip').setAttribute('class', 'chip ' + chipColor(bet[i].amt));
					last.el.querySelector('.chipSpan').innerText = bet[i].amt;
				}
			}
			break;
		}
	}

	if (currentBet === 0 && container.querySelector('.spinBtn')) {
		container.querySelector('.spinBtn').remove();
	}

	updateWagerLimits();
	refreshActionButtons();
}

function doubleAllBets() {
	if (bet.length === 0) return;

	let totalNeeded = bet.reduce((s, b) => s + b.amt, 0);
	if (totalNeeded > bankValue) return; // Not enough funds

	for (let i = 0; i < bet.length; i++) {
		let add = bet[i].amt;
		bankValue -= add;
		currentBet += add;
		bet[i].amt *= 2;

		if (bet[i].el) {
			let chip = bet[i].el.querySelector('.chip');
			if (chip) {
				chip.setAttribute('class', 'chip ' + chipColor(bet[i].amt));
				chip.querySelector('.chipSpan').innerText = bet[i].amt;
			}
		}
	}

	document.getElementById('bankSpan').innerText = bankValue.toLocaleString('de-DE');
	document.getElementById('betSpan').innerText = currentBet.toLocaleString('de-DE');
	updateWagerLimits();
	refreshActionButtons();
}

function repeatLastBet() {
	if (lastBetConfig.length === 0) return;

	let oldWager = wager;
	for (let config of lastBetConfig) {
		if (config.amt <= bankValue) {
			wager = config.amt;
			setBet(config.el, config.numbers, config.type, config.odds);
		}
	}
	wager = oldWager;
	updateWagerLimits();
}

/* ---------- CLEAR / RESET ---------- */

function clearBet() {
	bet = [];
	numbersBet = [];
}

/* ---------- SPIN ---------- */

function spin() {
	let winningSpin = Math.floor(Math.random() * 37);
	spinWheel(winningSpin);
	previousNumbers.push(winningSpin);

	// Save current bets for repeat
	lastBetConfig = bet.map(b => ({ el: b.el, numbers: b.numbers, type: b.type, odds: b.odds, amt: b.amt }));

	setTimeout(function () {
		let totalWin = 0;
		let totalBetAmount = 0;
		let hasWon = false;

		for (let i = 0; i < bet.length; i++) {
			let numArray = bet[i].numbers.split(',').map(s => parseInt(s.trim()));
			if (numArray.includes(winningSpin)) {
				hasWon = true;
				let winAmount = bet[i].amt * bet[i].odds;
				totalWin += winAmount;
				totalBetAmount += bet[i].amt;
				bankValue += (winAmount + bet[i].amt);
			}
		}

		// Track statistics
		gameStats.totalSpins++;
		numberFrequency[winningSpin]++;
		if (hasWon) {
			gameStats.wins++;
			if (gameStats.currentStreak < 0) gameStats.currentStreak = 1;
			else gameStats.currentStreak++;
			if (gameStats.currentStreak > gameStats.bestStreak) gameStats.bestStreak = gameStats.currentStreak;
			if (totalWin > gameStats.biggestWin) gameStats.biggestWin = totalWin;
		} else {
			gameStats.losses++;
			if (gameStats.currentStreak > 0) gameStats.currentStreak = -1;
			else gameStats.currentStreak--;
		}
		saveStats();
		updateStatsPanel();
		updateHotColdNumbers();

		if (hasWon) win(winningSpin, totalWin, totalBetAmount);

		currentBet = 0;
		document.getElementById('bankSpan').innerText = bankValue.toLocaleString('de-DE');
		document.getElementById('betSpan').innerText = currentBet.toLocaleString('de-DE');

		let pnClass = (numRed.includes(winningSpin)) ? 'pnRed' : ((winningSpin == 0) ? 'pnGreen' : 'pnBlack');
		let pnContent = document.getElementById('pnContent');
		let pnSpan = document.createElement('span');
		pnSpan.setAttribute('class', pnClass);
		pnSpan.innerText = winningSpin;
		pnContent.append(pnSpan);
		pnContent.scrollLeft = pnContent.scrollWidth;

		bet = [];
		numbersBet = [];
		removeChips();
		betHistoryStack = [];

		if (lastWager > 0 && lastWager <= 100) wager = lastWager;
		if (wager > bankValue) wager = bankValue;

		// Unlock repeat, lock undo/double
		let repeatBtn = document.getElementById('repeatBtn');
		if (repeatBtn) repeatBtn.disabled = lastBetConfig.length === 0;
		let undoBtn = document.getElementById('undoBtn');
		if (undoBtn) undoBtn.disabled = true;
		let doubleBtn = document.getElementById('doubleBtn');
		if (doubleBtn) doubleBtn.disabled = true;

		if (bankValue == 0 && currentBet == 0 && !isAutoSpinning) gameOver();
	}, 10000);
}

/* ---------- WIN DISPLAY ---------- */

function win(winningSpin, winValue, betTotal) {
	if (winValue <= 0) return;

	winDanceAnimation();
	confettiRain();

	let notification = document.createElement('div');
	notification.setAttribute('id', 'notification');

	let nSpan = document.createElement('div');
	nSpan.setAttribute('class', 'nSpan');

	let nsnumber = document.createElement('span');
	nsnumber.style.cssText = (numRed.includes(winningSpin)) ? 'color:#e8203a' : ((winningSpin == 0) ? 'color:#00cc88' : 'color:#888');
	nsnumber.innerText = winningSpin;
	nSpan.append(nsnumber);

	let nsTxt = document.createElement('span');
	nsTxt.style.cssText = 'font-size:28px;color:rgba(255,255,255,0.8);font-family:Inter,sans-serif;font-weight:400;';
	nsTxt.innerText = ' Gewinn!';
	nSpan.append(nsTxt);

	let nsWin = document.createElement('div');
	nsWin.setAttribute('class', 'nsWin');

	let b1 = document.createElement('div');
	b1.setAttribute('class', 'nsWinBlock');
	b1.innerText = 'Einsatz: ' + betTotal.toLocaleString('de-DE') + ' €';
	nsWin.append(b1);

	let b2 = document.createElement('div');
	b2.setAttribute('class', 'nsWinBlock');
	b2.innerText = 'Gewinn: ' + winValue.toLocaleString('de-DE') + ' €';
	nsWin.append(b2);

	let b3 = document.createElement('div');
	b3.setAttribute('class', 'nsWinBlock');
	b3.style.color = '#2ecc71';
	b3.innerText = 'Auszahlung: ' + (winValue + betTotal).toLocaleString('de-DE') + ' €';
	nsWin.append(b3);

	nSpan.append(nsWin);
	notification.append(nSpan);
	container.prepend(notification);

	setTimeout(function () { notification.style.cssText = 'opacity:0'; }, 3500);
	setTimeout(function () { notification.remove(); }, 4500);
}

/* ---------- HOT / COLD NUMBERS ---------- */

function updateHotColdNumbers() {
	document.querySelectorAll('.hotNumber, .coldNumber').forEach(el => {
		el.classList.remove('hotNumber', 'coldNumber');
	});

	if (gameStats.totalSpins < 5) return;

	let pairs = [];
	for (let i = 1; i <= 36; i++) {
		pairs.push({ num: i, freq: numberFrequency[i] });
	}
	pairs.sort((a, b) => b.freq - a.freq);
	let hot  = pairs.slice(0, 5).map(p => p.num);
	let cold = pairs.slice(-5).map(p => p.num);

	document.querySelectorAll('.number_block').forEach(block => {
		let num = parseInt(block.querySelector('.nbn')?.innerText);
		if (!isNaN(num)) {
			if (hot.includes(num))       block.classList.add('hotNumber');
			else if (cold.includes(num)) block.classList.add('coldNumber');
		}
	});
}

/* ---------- REMOVE CHIPS ---------- */

function removeChips() {
	let chips = document.getElementsByClassName('chip');
	if (chips.length > 0) {
		for (let i = 0; i < chips.length; i++) chips[i].remove();
		removeChips();
	}
}

/* ---------- WAGER LIMITS ---------- */

function updateWagerLimits() {
	let s = document.getElementById('wagerSlider');
	let inp = document.getElementById('wagerInput');
	if (!s || !inp) return;

	s.setAttribute('max', bankValue);
	inp.setAttribute('max', bankValue);
	if (wager > bankValue) wager = bankValue;
	s.value = wager;
	inp.value = wager;
	updateCurrentWagerDisplay();
}

/* ---------- AUTO SPIN ---------- */

let isAutoSpinning = false;
let autoSpinTarget = 0;
let autoSpinBetAmount = 1000000;
let autoSpinCount = 0;

function startAutoSpin() {
	autoSpinTarget = parseInt(document.getElementById('targetNumber').value);
	autoSpinBetAmount = parseInt(document.getElementById('betAmount').value);
	if (autoSpinTarget < 0 || autoSpinTarget > 36) { alert('Ziel muss zwischen 0 und 36 liegen!'); return; }
	if (autoSpinBetAmount < 1) { alert('Einsatz muss mindestens 1 sein!'); return; }
	isAutoSpinning = true;
	autoSpinCount = 0;
	if (!isNaN(autoSpinBetAmount) && autoSpinBetAmount > 0) {
		wager = Math.min(autoSpinBetAmount, bankValue);
		updateWagerLimits();
	}
	updateAutoSpinStatus('Auto Spin gestartet – Ziel: ' + autoSpinTarget);
	setTimeout(() => {
		performAutoSpin();
		if (!numbersBet.includes(autoSpinTarget)) numbersBet.push(autoSpinTarget);
	}, 500);
}

function stopAutoSpin() {
	isAutoSpinning = false;
	updateAutoSpinStatus('Auto Spin gestoppt');
	document.getElementById('autoSpinStartButton').disabled = false;
	document.getElementById('autoSpinStopButton').disabled = true;
}

function performAutoSpin() {
	if (!isAutoSpinning) return;
	autoSpinCount++;
	updateAutoSpinStatus('Spin #' + autoSpinCount + ' – Ziel: ' + autoSpinTarget);

	let betInput = document.getElementById('betAmount');
	autoSpinBetAmount = parseInt(betInput.value);
	wager = Math.min(autoSpinBetAmount, bankValue);

	let targetElement = null;
	if (autoSpinTarget === 0) {
		targetElement = document.querySelector('.number_0');
	} else {
		document.querySelectorAll('.number_block').forEach(block => {
			let t = block.querySelector('.nbn')?.innerText;
			if (parseInt(t) === autoSpinTarget) targetElement = block;
		});
	}

	if (targetElement) {
		if (autoSpinTarget === 0) setBet(targetElement, '0', 'zero', 35);
		else setBet(targetElement, autoSpinTarget.toString(), 'inside_whole', 35);
		let spinBtn = document.querySelector('.spinBtn');
		if (spinBtn) spinBtn.click();
		setTimeout(() => checkAutoSpinResult(), 11000);
	}
}

function checkAutoSpinResult() {
	if (!isAutoSpinning) return;
	let lastResult = previousNumbers[previousNumbers.length - 1];
	updateAutoSpinStatus('Spin #' + autoSpinCount + ' – Ergebnis: ' + lastResult + ' (Ziel: ' + autoSpinTarget + ')');

	if (lastResult === autoSpinTarget) {
		stopAutoSpin();
		updateAutoSpinStatus('🎉 GEWONNEN! Ziel ' + autoSpinTarget + ' nach ' + autoSpinCount + ' Spins!');
		return;
	}
	if (bankValue === 0) {
		let refill = parseInt(document.getElementById('betAmount').value);
		if (!isNaN(refill) && refill > 0) {
			bankValue += refill;
			wager = refill;
			updateWagerLimits();
			updateAutoSpinStatus('Bankrott – ' + refill.toLocaleString('de-DE') + ' € wiederhergestellt');
		} else {
			updateAutoSpinStatus('Ungültiger Einsatz – Auto Spin gestoppt');
			stopAutoSpin();
			return;
		}
	}
	setTimeout(() => performAutoSpin(), 2000);
}

function updateAutoSpinStatus(msg) {
	let el = document.querySelector('.autoSpinStatus');
	if (el) el.innerText = msg;
}

function executeIDDWDCheat() {
	bankValue += 10000000;
	document.getElementById('bankSpan').innerText = bankValue.toLocaleString('de-DE');
	document.querySelectorAll('.cdChip').forEach(chip => {
		let span = chip.querySelector('.cdChipSpan');
		if (span && span.innerText === '100') span.innerText = '1000000';
	});
	updateWagerLimits();
}

/* ---------- WHEEL ANIMATION ---------- */

function spinWheel(winningSpin) {
	let degree = 362;
	for (let i = 0; i < wheelnumbersAC.length; i++) {
		if (wheelnumbersAC[i] == winningSpin) {
			degree = (i * 9.73) + 362;
		}
	}
	wheel.style.cssText = 'animation: wheelRotate 5s linear infinite;';
	ballTrack.style.cssText = 'animation: ballRotate 1s linear infinite;';

	setTimeout(function () {
		ballTrack.style.cssText = 'animation: ballRotate 2s linear infinite;';
		style = document.createElement('style');
		style.innerText = '@keyframes ballStop {from{transform:rotate(0deg);}to{transform:rotate(-' + degree + 'deg);}}';
		document.head.appendChild(style);
	}, 2000);
	setTimeout(function () {
		ballTrack.style.cssText = 'animation: ballStop 3s linear;';
	}, 6000);
	setTimeout(function () {
		ballTrack.style.cssText = 'transform: rotate(-' + degree + 'deg);';
	}, 9000);
	setTimeout(function () {
		wheel.style.cssText = '';
		style.remove();
	}, 10000);
}

/* ---------- WIN ANIMATIONS ---------- */

let style = document.createElement('style');
style.innerHTML = `
@keyframes spinDance {
	0%   { transform: translate(-50%,-50%) rotate(0deg) scale(1); }
	50%  { transform: translate(-50%,-160%) rotate(180deg) scale(1.3); }
	100% { transform: translate(-50%,-50%) rotate(360deg) scale(1); }
}`;
document.head.appendChild(style);

let confettiStyle = document.createElement('style');
confettiStyle.innerHTML = `
@keyframes fall {
	to { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}`;
document.head.appendChild(confettiStyle);

function winDanceAnimation() {
	let chip = document.createElement('div');
	chip.innerText = '💰';
	chip.style.cssText = 'position:fixed;left:50%;top:50%;font-size:48px;z-index:10000;animation:spinDance 2s ease-in-out;pointer-events:none;';
	document.body.appendChild(chip);
	setTimeout(() => chip.remove(), 2100);
}

function confettiRain() {
	const emojis = ['🎉', '✨', '💎', '🏆', '⭐', '🌟'];
	for (let i = 0; i < 25; i++) {
		let dot = document.createElement('div');
		dot.innerText = emojis[Math.floor(Math.random() * emojis.length)];
		dot.style.cssText = 'position:fixed;left:' + (Math.random() * 100) + '%;top:-5%;font-size:' + (18 + Math.random() * 16) + 'px;z-index:9999;animation:fall ' + (1.5 + Math.random() * 2.5) + 's linear forwards;pointer-events:none;';
		document.body.appendChild(dot);
		setTimeout(() => dot.remove(), 4500);
	}
}

/* ---------- SECRET BUTTON ---------- */

let secretBtn = document.createElement('button');
secretBtn.style.cssText = 'position:fixed;bottom:10px;right:10px;width:40px;height:40px;opacity:0;z-index:9999;cursor:default;';
secretBtn.onclick = function () {
	bankValue += 10000;
	document.getElementById('bankSpan').innerText = bankValue.toLocaleString('de-DE');
	document.querySelectorAll('.cdChip').forEach(chip => {
		let span = chip.querySelector('.cdChipSpan');
		if (span && span.innerText === '100') span.innerText = '1000';
	});
	updateWagerLimits();
};
document.body.appendChild(secretBtn);

/* ---------- DEPOSIT ---------- */

function checkPendingDeposit() {
	const raw = localStorage.getItem('royalRouletteDeposit');
	if (!raw) return;
	const amount = parseInt(raw);
	localStorage.removeItem('royalRouletteDeposit');
	if (isNaN(amount) || amount <= 0) return;

	setTimeout(() => {
		bankValue += amount;
		let el = document.getElementById('bankSpan');
		if (el) el.innerText = bankValue.toLocaleString('de-DE');
		updateWagerLimits();
		updateStatsPanel();
		saveStats(); // persist updated bankValue

		// Toast notification
		let toast = document.createElement('div');
		toast.style.cssText = [
			'position:fixed', 'bottom:30px', 'left:50%',
			'transform:translateX(-50%)',
			'background:linear-gradient(135deg,#0b2b0b,#155215)',
			'border:1px solid rgba(46,204,113,0.5)',
			'border-radius:12px', 'padding:14px 26px',
			'font-family:Inter,sans-serif', 'font-size:15px',
			'font-weight:700', 'color:#2ecc71',
			'z-index:99999',
			'box-shadow:0 6px 30px rgba(0,0,0,0.7)',
			'white-space:nowrap',
			'transition:opacity 0.5s'
		].join(';');
		toast.textContent = '✅  ' + amount.toLocaleString('de-DE') + ' € erfolgreich aufgeladen!';
		document.body.appendChild(toast);
		setTimeout(() => { toast.style.opacity = '0'; }, 3200);
		setTimeout(() => toast.remove(), 3800);
	}, 400);
}

// Handle bfcache (browser back/forward cache): page may be restored from cache
// without re-running the script, so we check for pending deposit on every pageshow
window.addEventListener('pageshow', function (event) {
	if (event.persisted) {
		checkPendingDeposit();
	}
});

let depositBtn = document.createElement('button');
depositBtn.setAttribute('id', 'depositBtn');
depositBtn.innerText = '💳 Einzahlen';
depositBtn.onclick = function () { window.location.href = 'deposit.html'; };
document.body.appendChild(depositBtn);

/* ---------- EXIT BUTTON ---------- */

let exitBtn = document.createElement('button');
exitBtn.setAttribute('id', 'exitBtn');
exitBtn.innerText = '✕ Spiel verlassen';
exitBtn.onclick = function () {
	const leave = confirm('⚠️  99% der Spieler hören zu früh auf – vielleicht wär der nächste Dreh dein Gewinn gewesen!\n\nWirklich aufhören?');
	if (leave) window.location.href = 'https://www.google.com';
};
document.body.appendChild(exitBtn);

/* ---------- KEYBOARD SHORTCUTS ---------- */

document.addEventListener('keydown', (e) => {
	if (e.key.toLowerCase() === 'c') {
		document.body.style.backgroundColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
	}
});

document.addEventListener('keydown', (e) => {
	if (e.key.toLowerCase() === 'x') {
		let boom = document.createElement('div');
		boom.innerText = '💥💥💥';
		boom.style.cssText = 'position:fixed;top:40%;left:50%;font-size:70px;transform:translate(-50%,-50%);z-index:10000;';
		document.body.innerHTML = '';
		document.body.appendChild(boom);
	}
});

/* ---------- CHEAT CODES ---------- */

let cheatInput = '';
document.addEventListener('keydown', (e) => {
	cheatInput += e.key.toLowerCase();
	if (cheatInput.endsWith('iddqd')) {
		bankValue += 1000000;
		document.getElementById('bankSpan').innerText = bankValue.toLocaleString('de-DE');
		document.querySelectorAll('.cdChip').forEach(chip => {
			let span = chip.querySelector('.cdChipSpan');
			if (span && span.innerText === '100') span.innerText = '100000';
		});
		updateWagerLimits();
		cheatInput = '';
	} else if (cheatInput.endsWith('iddwd')) {
		executeIDDWDCheat();
		cheatInput = '';
	} else if (cheatInput.endsWith('iddsd')) {
		let el = document.querySelector('.autoSpinControls');
		if (el) {
			el.classList.add('active');
			updateAutoSpinStatus('🟢 Cheat aktiv – Auto Spin bereit!');
		}
		cheatInput = '';
	}
	if (cheatInput.length > 10) cheatInput = cheatInput.slice(-10);
});

/* ---------- PAGE LEAVE WARNING ---------- */

window.addEventListener('beforeunload', function (e) {
	e.preventDefault();
});
