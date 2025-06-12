let bankValue = 1000;
let currentBet = 0;
let wager = 5;
let lastWager = 0;
let bet = [];
let numbersBet = [];
let previousNumbers = [];
let lastBetTarget = null;

let numRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
let wheelnumbersAC = [0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32];

let container = document.createElement('div');
container.setAttribute('id', 'container');
document.body.append(container);

startGame();

let wheel = document.getElementsByClassName('wheel')[0];
let ballTrack = document.getElementsByClassName('ballTrack')[0];

function resetGame(){
	bankValue = 1000;
	currentBet = 0;
	wager = 5;
	updateWagerLimits();
	bet = [];
	numbersBet = [];
	previousNumbers = [];
	document.getElementById('betting_board').remove();
	document.getElementById('notification').remove();
	buildBettingBoard();
	lastBetTarget = null;
}

function startGame(){
	buildWheel();
	buildBettingBoard();
}

function gameOver(){
	let notification = document.createElement('div');
	notification.setAttribute('id', 'notification');
	let nSpan = document.createElement('span');
	nSpan.setAttribute('class', 'nSpan');
	nSpan.innerText = 'Bankrupt';
	notification.append(nSpan);

	let nBtn = document.createElement('div');
	nBtn.setAttribute('class', 'nBtn');
	nBtn.innerText = 'Play again';
	nBtn.onclick = function(){
		resetGame();
	};
	notification.append(nBtn);
	container.prepend(notification);
}

function buildWheel(){
	let wheel = document.createElement('div');
	wheel.setAttribute('class', 'wheel');

	let outerRim = document.createElement('div');
	outerRim.setAttribute('class', 'outerRim');
	wheel.append(outerRim);

	let numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
	for(i = 0; i < numbers.length; i++){
		let a = i + 1;
		let spanClass = (numbers[i] < 10)? 'single' : 'double';
		let sect = document.createElement('div');
		sect.setAttribute('id', 'sect'+a);
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

function buildBettingBoard(){
	let bettingBoard = document.createElement('div');
	bettingBoard.setAttribute('id', 'betting_board');

	let wl = document.createElement('div');
	wl.setAttribute('class', 'winning_lines');

	var wlttb = document.createElement('div');
	wlttb.setAttribute('id', 'wlttb_top');
	wlttb.setAttribute('class', 'wlttb');
	for(i = 0; i < 11; i++){
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
		ttbbetblock.onclick = function(){
			setBet(this, num, objType, 5);
		};
		ttbbetblock.oncontextmenu = function(e){
			e.preventDefault();
			removeBet(this, num, objType, 5);
		};
		wlttb.append(ttbbetblock);
	}
	wl.append(wlttb);

	for(c =  1; c < 4; c++){
		let d = c;
		var wlttb = document.createElement('div');
		wlttb.setAttribute('id', 'wlttb_'+c);
		wlttb.setAttribute('class', 'wlttb');
		for(i = 0; i < 12; i++){
			let j = i;
			var ttbbetblock = document.createElement('div');
			ttbbetblock.setAttribute('class', 'ttbbetblock');
			ttbbetblock.onclick = function(){
				if(d == 1 || d == 2){
					var numA = ((2 - (d - 1)) + (3 * j));
					var numB = ((3 - (d - 1)) + (3 * j));
					var num = numA + ', ' + numB;
				}
				else{
					var numA = (1 + (3 * j));
					var numB = (2 + (3 * j));
					var numC = (3 + (3 * j));
					var num = numA + ', ' + numB + ', ' + numC;
				}
				var objType = (d == 3)? 'street' : 'split';
				var odd = (d == 3)? 11 : 17;
				setBet(this, num, objType, odd);
			};
			ttbbetblock.oncontextmenu = function(e){
				e.preventDefault();
				if(d == 1 || d == 2){
					var numA = ((2 - (d - 1)) + (3 * j));
					var numB = ((3 - (d - 1)) + (3 * j));
					var num = numA + ', ' + numB;
				}
				else{
					var numA = (1 + (3 * j));
					var numB = (2 + (3 * j));
					var numC = (3 + (3 * j));
					var num = numA + ', ' + numB + ', ' + numC;
				}
				var objType = (d == 3)? 'street' : 'split';
				var odd = (d == 3)? 11 : 17;
				removeBet(this, num, objType, odd);
			};
			wlttb.append(ttbbetblock);
		}
		wl.append(wlttb);
	}

	for(c = 1; c < 12; c++){
		let d = c;
		var wlrtl = document.createElement('div');
		wlrtl.setAttribute('id', 'wlrtl_'+c);
		wlrtl.setAttribute('class', 'wlrtl');
		for(i = 1; i < 4; i++){
			let j = i;
			var rtlbb = document.createElement('div');
			rtlbb.setAttribute('class', 'rtlbb'+i);
			var numA = (3 + (3 * (d - 1))) - (j - 1);
			var numB = (6 + (3 * (d - 1))) - (j - 1);
			let num = numA + ', ' + numB;
			rtlbb.onclick = function(){
				setBet(this, num, 'split', 17);
			};
			rtlbb.oncontextmenu = function(e){
				e.preventDefault();
				removeBet(this, num, 'split', 17);
			};
			wlrtl.append(rtlbb);
		}
		wl.append(wlrtl);
	}

	for(c = 1; c < 3; c++){
		var wlcb = document.createElement('div');
		wlcb.setAttribute('id', 'wlcb_'+c);
		wlcb.setAttribute('class', 'wlcb');
		for(i = 1; i < 12; i++){
			let count = (c == 1)? i : i + 11;
			var cbbb = document.createElement('div');
			cbbb.setAttribute('id', 'cbbb_'+count);
			cbbb.setAttribute('class', 'cbbb');
			var numA = '2';
			var numB = '3';
			var numC = '5';
			var numD = '6';
			let num = (count >= 1 && count < 12)? (parseInt(numA) + ((count - 1) * 3)) + ', ' + (parseInt(numB)+((count - 1) * 3)) + ', ' + (parseInt(numC)+((count - 1) * 3)) + ', ' + (parseInt(numD)+((count - 1) * 3)) : ((parseInt(numA) - 1) + ((count - 12) * 3)) + ', ' + ((parseInt(numB) - 1)+((count - 12) * 3)) + ', ' + ((parseInt(numC) - 1)+((count - 12) * 3)) + ', ' + ((parseInt(numD) - 1)+((count - 12) * 3));
			var objType = 'corner_bet';
			cbbb.onclick = function(){
				setBet(this, num, objType, 8);
			};
			cbbb.oncontextmenu = function(e){
				e.preventDefault();
				removeBet(this, num, objType, 8);
			};
			wlcb.append(cbbb);
		}
		wl.append(wlcb);
	}

	bettingBoard.append(wl);

	let bbtop = document.createElement('div');
	bbtop.setAttribute('class', 'bbtop');
	let bbtopBlocks = ['1 to 18', '19 to 36'];
	for(i = 0; i < bbtopBlocks.length; i++){
		let f = i;
		var bbtoptwo = document.createElement('div');
		bbtoptwo.setAttribute('class', 'bbtoptwo');
		let num = (f == 0)? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18' : '19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36';
		var objType = (f == 0)? 'outside_low' : 'outside_high';
		bbtoptwo.onclick = function(){
			setBet(this, num, objType, 1);
		};
		bbtoptwo.oncontextmenu = function(e){
			e.preventDefault();
			removeBet(this, num, objType, 1);
		};
		bbtoptwo.innerText = bbtopBlocks[i];
		bbtop.append(bbtoptwo);
	}
	bettingBoard.append(bbtop);

	let numberBoard = document.createElement('div');
	numberBoard.setAttribute('class', 'number_board');

	let zero = document.createElement('div');
	zero.setAttribute('class', 'number_0');
	var objType = 'zero';
	var odds = 35;
	zero.onclick = function(){
		setBet(this, '0', objType, odds);
	};
	zero.oncontextmenu = function(e){
		e.preventDefault();
		removeBet(this, '0', objType, odds);
	};
	let nbnz = document.createElement('div');
	nbnz.setAttribute('class', 'nbn');
	nbnz.innerText = '0';
	zero.append(nbnz);
	numberBoard.append(zero);

	var numberBlocks = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, '2 to 1', 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, '2 to 1', 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, '2 to 1'];
	var redBlocks = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
	for(i = 0; i < numberBlocks.length; i++){
		let a = i;
		var nbClass = (numberBlocks[i] == '2 to 1')? 'tt1_block' : 'number_block';
		var colourClass = (redBlocks.includes(numberBlocks[i]))? ' redNum' : ((nbClass == 'number_block')? ' blackNum' : '');
		var numberBlock = document.createElement('div');
		numberBlock.setAttribute('class', nbClass + colourClass);
		numberBlock.onclick = function(){
			if(numberBlocks[a] != '2 to 1'){
				setBet(this, ''+numberBlocks[a]+'', 'inside_whole', 35);
			}else{
				num = (a == 12)? '3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36' : ((a == 25)? '2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35' : '1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34');
				setBet(this, num, 'outside_column', 2);
			}
		};
		numberBlock.oncontextmenu = function(e){
			e.preventDefault();
			if(numberBlocks[a] != '2 to 1'){
				removeBet(this, ''+numberBlocks[a]+'', 'inside_whole', 35);
			}else{
				num = (a == 12)? '3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36' : ((a == 25)? '2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35' : '1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34');
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

	let bo3Board = document.createElement('div');
	bo3Board.setAttribute('class', 'bo3_board');
	let bo3Blocks = ['1 to 12', '13 to 24', '25 to 36'];
	for(i = 0; i < bo3Blocks.length; i++){
		let b = i;
		var bo3Block = document.createElement('div');
		bo3Block.setAttribute('class', 'bo3_block');
		bo3Block.onclick = function(){
			num = (b == 0)? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12' : ((b == 1)? '13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24' : '25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36');
			setBet(this, num, 'outside_dozen', 2);
		};
		bo3Block.oncontextmenu = function(e){
			e.preventDefault();
			num = (b == 0)? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12' : ((b == 1)? '13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24' : '25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36');
			removeBet(this, num, 'outside_dozen', 2);
		};
		bo3Block.innerText = bo3Blocks[i];
		bo3Board.append(bo3Block);
	}
	bettingBoard.append(bo3Board);

	let otoBoard = document.createElement('div');
	otoBoard.setAttribute('class', 'oto_board');
	let otoBlocks = ['EVEN', 'RED', 'BLACK', 'ODD'];
	for(i = 0; i < otoBlocks.length; i++){
		let d = i;
		var colourClass = (otoBlocks[i] == 'RED')? ' redNum' : ((otoBlocks[i] == 'BLACK')? ' blackNum' : '');
		var otoBlock = document.createElement('div');
		otoBlock.setAttribute('class', 'oto_block' + colourClass);
		otoBlock.onclick = function(){
			num = (d == 0)? '2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36' : ((d == 1)? '1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36' : ((d == 2)? '2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35' : '1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35'));
			setBet(this, num, 'outside_oerb', 1);
		};
		otoBlock.oncontextmenu = function(e){
			num = (d == 0)? '2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36' : ((d == 1)? '1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36' : ((d == 2)? '2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35' : '1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35'));
			e.preventDefault();
			removeBet(this, num, 'outside_oerb', 1);
		};
		otoBlock.innerText = otoBlocks[i];
		otoBoard.append(otoBlock);
	}
	bettingBoard.append(otoBoard);

	let chipDeck = document.createElement('div');
	chipDeck.setAttribute('class', 'chipDeck');
	let chipValues = [1, 5, 10, 100, 'clear'];
	for(i = 0; i < chipValues.length; i++){
		let cvi = i;
		let chipColour = (i == 0)? 'red' : ((i == 1)? 'blue cdChipActive' : ((i == 2)? 'orange' : ((i == 3)? 'gold' : 'clearBet')));
		let chip = document.createElement('div');
		chip.setAttribute('class', 'cdChip ' + chipColour);
		chip.onclick = function(){
			if(cvi !== 4){
				let cdChipActive = document.getElementsByClassName('cdChipActive');
				for(i = 0; i < cdChipActive.length; i++){
					cdChipActive[i].classList.remove('cdChipActive');
				}
				let curClass = this.getAttribute('class');
				if(!curClass.includes('cdChipActive')){
					this.setAttribute('class', curClass + ' cdChipActive');
				}
				wager = parseInt(chip.childNodes[0].innerText);
			}else{
				bankValue = bankValue + currentBet;
				currentBet = 0;
				document.getElementById('bankSpan').innerText = '' + bankValue.toLocaleString("en-GB") + '';
				document.getElementById('betSpan').innerText = '' + currentBet.toLocaleString("en-GB") + '';
				clearBet();
				removeChips();
			}
		};
		let chipSpan = document.createElement('span');
		chipSpan.setAttribute('class', 'cdChipSpan');
		chipSpan.innerText = chipValues[i];
		chip.append(chipSpan);
		chipDeck.append(chip);
	}
	bettingBoard.append(chipDeck);

	// Einsatz-Steuerung hinzufügen
	let wagerControls = document.createElement('div');
	wagerControls.setAttribute('class', 'wagerControls');

	let wagerLabel = document.createElement('div');
	wagerLabel.setAttribute('class', 'wagerLabel');
	wagerLabel.innerText = 'Individueller Einsatz:';
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
	wagerInput.setAttribute('placeholder', 'Einsatz');

	wagerSlider.addEventListener('input', function() {
		let newWager = parseInt(this.value);
		if (newWager <= bankValue && newWager >= 1) {
			wager = newWager;
			wagerInput.value = newWager;

			let cdChipActive = document.getElementsByClassName('cdChipActive');
			for(let i = 0; i < cdChipActive.length; i++){
				cdChipActive[i].classList.remove('cdChipActive');
			}

			let displayElement = document.querySelector('.currentWagerDisplay');
			if (displayElement) {
				displayElement.innerText = 'Aktueller Einsatz: ' + wager;
			}
		}
	});

	wagerInput.addEventListener('input', function() {
		let newWager = parseInt(this.value);
		if (newWager <= bankValue && newWager >= 1) {
			wager = newWager;
			wagerSlider.value = newWager;

			let cdChipActive = document.getElementsByClassName('cdChipActive');
			for(let i = 0; i < cdChipActive.length; i++){
				cdChipActive[i].classList.remove('cdChipActive');
			}
		} else if (newWager > bankValue) {
			this.value = bankValue;
			wager = bankValue;
			wagerSlider.value = bankValue;
		} else if (newWager < 1 || isNaN(newWager)) {
			this.value = 1;
			wager = 1;
			wagerSlider.value = 1;
		}

		let displayElement = document.querySelector('.currentWagerDisplay');
		if (displayElement) {
			displayElement.innerText = 'Aktueller Einsatz: ' + wager;
		}
	});

	let currentWagerDisplay = document.createElement('div');
	currentWagerDisplay.setAttribute('class', 'currentWagerDisplay');
	currentWagerDisplay.innerText = 'Aktueller Einsatz: ' + wager;

	let maxButton = document.createElement('button');
	maxButton.setAttribute('class', 'maxButton');
	maxButton.innerText = 'MAX';
	maxButton.onclick = function() {
		wager = bankValue;

		let sliderElement = document.getElementById('wagerSlider');
		let inputElement = document.getElementById('wagerInput');

		if (sliderElement && inputElement) {
			sliderElement.value = bankValue;
			inputElement.value = bankValue;
		}

		let cdChipActive = document.getElementsByClassName('cdChipActive');
		for(let i = 0; i < cdChipActive.length; i++){
			cdChipActive[i].classList.remove('cdChipActive');
		}

		let displayElement = document.querySelector('.currentWagerDisplay');
		if (displayElement) {
			displayElement.innerText = 'Aktueller Einsatz: ' + wager.toLocaleString("en-GB");
		}
	};

	sliderContainer.append(wagerSlider);
	sliderContainer.append(wagerInput);
	sliderContainer.append(maxButton);

	wagerControls.append(sliderContainer);
	wagerControls.append(currentWagerDisplay);

	bettingBoard.append(wagerControls);

	// AUTO SPIN MODUS
	let autoSpinControls = document.createElement('div');
	autoSpinControls.setAttribute('class', 'autoSpinControls');

	let autoSpinLabel = document.createElement('div');
	autoSpinLabel.setAttribute('class', 'autoSpinLabel');
	autoSpinLabel.innerText = 'Auto Spin Modus:';
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

	autoSpinContainer.append(targetNumberInput);
	autoSpinContainer.append(betAmountInput);
	autoSpinControls.append(autoSpinContainer);
	autoSpinContainer.append(autoSpinStartButton);
	autoSpinContainer.append(autoSpinStopButton);

	let autoSpinStatus = document.createElement('div');
	autoSpinStatus.setAttribute('class', 'autoSpinStatus');
	autoSpinStatus.innerText = 'Bereit zum Start';
	autoSpinControls.append(autoSpinStatus);

	bettingBoard.append(autoSpinControls);

	let bankContainer = document.createElement('div');
	bankContainer.setAttribute('class', 'bankContainer');

	let bank = document.createElement('div');
	bank.setAttribute('class', 'bank');
	let bankSpan = document.createElement('span');
	bankSpan.setAttribute('id', 'bankSpan');
	bankSpan.innerText = '' + bankValue.toLocaleString("en-GB") + '';
	bank.append(bankSpan);
	bankContainer.append(bank);

	let bet = document.createElement('div');
	bet.setAttribute('class', 'bet');
	let betSpan = document.createElement('span');
	betSpan.setAttribute('id', 'betSpan');
	betSpan.innerText = '' + currentBet.toLocaleString("en-GB") + '';
	bet.append(betSpan);
	bankContainer.append(bet);
	bettingBoard.append(bankContainer);

	let pnBlock = document.createElement('div');
	pnBlock.setAttribute('class', 'pnBlock');
	let pnContent = document.createElement('div');
	pnContent.setAttribute('id', 'pnContent');
	pnContent.onwheel = function(e){
		e.preventDefault();
		pnContent.scrollLeft += e.deltaY;
	};
	pnBlock.append(pnContent);
	bettingBoard.append(pnBlock);

	container.append(bettingBoard);

	let quotes = [
		"🎲 Vertrauen Sie Ihrem Glück!",
		"🍀 Heute ist Ihr Tag!",
		"💸 Wer nicht wagt, der nicht gewinnt!",
		"🎯 Setzen Sie auf Ihr Bauchgefühl!",
		"🔥 Glück ist, wenn Vorbereitung auf Gelegenheit trifft!",
		"🃏 Der nächste Dreh gehört Ihnen!",
		"🏆 Das große Glück wartet!",
		"💰 Jeder Einsatz zählt!",
		"🎲 Ihre Glückssträhne beginnt jetzt!",
		"🌟 Träumen Sie groß – gewinnen Sie größer!",
		"🔮 Heute schreiben Sie Geschichte!",
		"💎 Gewinne entstehen im Kopf!",
		"🎉 Alles kann, nichts muss – setzen Sie klug!",
		"💪 Nur wer spielt, kann auch gewinnen!",
		"🍀 Glück ist auf Ihrer Seite!",
		"🤑 Der Jackpot ruft!",
		"🎰 Jeder Dreh ein Abenteuer!",
		"🥂 Auf Ihr Glück!",
		"👑 Nur ein Dreh zum König!",
		"💫 Machen Sie Ihr Spiel!"
	];

	function createQuoteBox(side) {
		let quoteBox = document.createElement('div');
		quoteBox.setAttribute('class', side === 'left' ? 'quoteLeft' : 'quoteRight');
		quoteBox.innerText = getRandomQuote();
		document.body.appendChild(quoteBox);

		setInterval(() => {
			quoteBox.innerText = getRandomQuote();
		}, 10000);
	}

	function getRandomQuote() {
		return quotes[Math.floor(Math.random() * quotes.length)];
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
}

function clearBet(){
	bet = [];
	numbersBet = [];
}

// Auto Spin Variablen
let isAutoSpinning = false;
let autoSpinTarget = 0;
let autoSpinBetAmount = 1000000;
let autoSpinCount = 0;

// Auto Spin Funktionen
function startAutoSpin() {
	autoSpinTarget = parseInt(document.getElementById('targetNumber').value);
	autoSpinBetAmount = parseInt(document.getElementById('betAmount').value);

	if (autoSpinTarget < 0 || autoSpinTarget > 36) {
		alert('Ziel muss zwischen 0 und 36 liegen!');
		return;
	}

	if (autoSpinBetAmount < 1) {
		alert('Einsatz muss mindestens 1 sein!');
		return;
	}

	isAutoSpinning = true;
	autoSpinCount = 0;

	// Hier wird der Einsatz aus dem Feld übernommen
	if (!isNaN(autoSpinBetAmount) && autoSpinBetAmount > 0) {
		wager = Math.min(autoSpinBetAmount, bankValue);
		updateWagerLimits();
	}

	updateAutoSpinStatus(`Auto Spin gestartet - Ziel: ${autoSpinTarget}`);

	setTimeout(() => {
		performAutoSpin();
		if (!numbersBet.includes(autoSpinTarget)) {
			numbersBet.push(autoSpinTarget);
		}
	}, 500);
}


function stopAutoSpin() {
	isAutoSpinning = false;
	updateAutoSpinStatus('Auto Spin gestoppt');

	// Buttons umschalten
	document.getElementById('autoSpinStartButton').disabled = false;
	document.getElementById('autoSpinStopButton').disabled = true;
}

function executeIDDWDCheat() {
	bankValue += 10000000;
	document.getElementById('bankSpan').innerText = bankValue.toLocaleString("en-GB");
	document.querySelectorAll('.cdChip').forEach(chip => {
		let span = chip.querySelector('.cdChipSpan');
		if (span && span.innerText === '100') {
			span.innerText = '1000000';
		}
	});
	updateWagerLimits();
}

function performAutoSpin() {
	if (!isAutoSpinning) return;

	autoSpinCount++;
	updateAutoSpinStatus(`Spin #${autoSpinCount} - Ziel: ${autoSpinTarget}`);

	// Gesamtes Guthaben setzen
	// Einsatz aus dem Inputfeld nehmen, ggf. anpassen
	let betInput = document.getElementById('betAmount');
	autoSpinBetAmount = parseInt(betInput.value);
	wager = Math.min(autoSpinBetAmount, bankValue);

	// Auf Ziel-Zahl setzen
	let targetElement = null;

	if (autoSpinTarget === 0) {
		targetElement = document.querySelector('.number_0');
	} else {
		let numberBlocks = document.querySelectorAll('.number_block');
		numberBlocks.forEach(block => {
			let numberText = block.querySelector('.nbn')?.innerText;
			if (parseInt(numberText) === autoSpinTarget) {
				targetElement = block;
			}
		});
	}

	if (targetElement) {
		// Einsatz platzieren
		if (autoSpinTarget === 0) {
			setBet(targetElement, '0', 'zero', 35);
		} else {
			setBet(targetElement, autoSpinTarget.toString(), 'inside_whole', 35);
		}

		// Spin auslösen
		let spinBtn = document.querySelector('.spinBtn');
		if (spinBtn) {
			spinBtn.click();
		}

		// Nach Spin-Dauer prüfen
		setTimeout(() => {
			checkAutoSpinResult();
		}, 11000);
	}
}

function checkAutoSpinResult() {
	if (!isAutoSpinning) return;

	// Letztes Spin-Ergebnis aus previousNumbers holen
	let lastResult = previousNumbers[previousNumbers.length - 1];
	if (lastResult === undefined) {
		// Fallback: Aus pnContent lesen
		let pnContent = document.getElementById('pnContent');
		let lastSpan = pnContent.lastElementChild;
		if (lastSpan) {
			lastResult = parseInt(lastSpan.innerText);
		}
	}

	updateAutoSpinStatus(`Spin #${autoSpinCount} - Ergebnis: ${lastResult} (Ziel: ${autoSpinTarget})`);

	if (lastResult === autoSpinTarget) {
		// Ziel erreicht - Auto Spin stoppen
		stopAutoSpin();
		updateAutoSpinStatus(`🎉 GEWONNEN! Ziel ${autoSpinTarget} nach ${autoSpinCount} Spins erreicht!`);
		return;
	}

	// Nicht gewonnen - prüfen ob bankrott
	if (bankValue === 0) {
	let betInput = document.getElementById('betAmount');
	let refillAmount = parseInt(betInput.value);
	if (!isNaN(refillAmount) && refillAmount > 0) {
		bankValue += refillAmount;
		wager = refillAmount;
		updateWagerLimits();
		updateAutoSpinStatus(`Bankrott – ${refillAmount.toLocaleString()} € wiederhergestellt`);
	} else {
		updateAutoSpinStatus('Ungültiger AutoSpin-Einsatz – AutoSpin gestoppt');
		stopAutoSpin();
		return;
	}
}


	// Nächsten Spin nach kurzer Pause
	setTimeout(() => {
		performAutoSpin();
	}, 2000);
}

function updateAutoSpinStatus(message) {
	document.querySelector('.autoSpinStatus').innerText = message;
}

function setBet(e, n, t, o){
	lastWager = wager;

	// Prüfen ob genug Guthaben vorhanden ist
	if(wager > bankValue) {
		wager = bankValue;
	}

	if(wager > 0) {
		if (!container.querySelector('.spinBtn')) {
			let spinBtn = document.createElement('div');
			spinBtn.setAttribute('class', 'spinBtn');
			spinBtn.innerText = 'spin';
			spinBtn.onclick = function () {
				this.remove();
				spin();
			};
			container.append(spinBtn);
		}

		bankValue = bankValue - wager;
		currentBet = currentBet + wager;
		document.getElementById('bankSpan').innerText = '' + bankValue.toLocaleString("en-GB") + '';
		document.getElementById('betSpan').innerText = '' + currentBet.toLocaleString("en-GB") + '';

		// WICHTIGER FIX: Variable korrekt in Closure einschließen
		let currentNumbers = n;
		let currentType = t;
		let currentOdds = o;

		// Prüfen ob bereits ein Einsatz auf diesem Feld existiert
		let existingBet = null;
		for (i = 0; i < bet.length; i++) {
			if (bet[i].numbers == currentNumbers && bet[i].type == currentType) {
				existingBet = bet[i];
				bet[i].amt = bet[i].amt + wager;
				let chipColour = (bet[i].amt < 5) ? 'red' : ((bet[i].amt < 10) ? 'blue' : ((bet[i].amt < 100) ? 'orange' : 'gold'));
				e.querySelector('.chip').style.cssText = '';
				e.querySelector('.chip').setAttribute('class', 'chip ' + chipColour);
				let chipSpan = e.querySelector('.chipSpan');
				chipSpan.innerText = bet[i].amt;
				updateWagerLimits();
				return;
			}
		}

		// Neuen Einsatz erstellen
		var obj = {
			amt: wager,
			type: currentType,
			odds: currentOdds,
			numbers: currentNumbers
		};
		bet.push(obj);

		let numArray = currentNumbers.split(',').map(s => parseInt(s.trim()));
		for (i = 0; i < numArray.length; i++) {
			if (!numbersBet.includes(numArray[i])) {
				numbersBet.push(numArray[i]);
			}
		}

		// Neuen Chip erstellen mit korrektem Wert
		if (!e.querySelector('.chip')) {
			let chipColour = (wager < 5) ? 'red' : ((wager < 10) ? 'blue' : ((wager < 100) ? 'orange' : 'gold'));
			let chip = document.createElement('div');
			chip.setAttribute('class', 'chip ' + chipColour);
			let chipSpan = document.createElement('span');
			chipSpan.setAttribute('class', 'chipSpan');
			chipSpan.innerText = wager;
			chip.append(chipSpan);
			e.append(chip);
		}

		// updateWagerLimits erst NACH dem Setzen aufrufen
		updateWagerLimits();
	}
}

function spin(){
	var winningSpin = Math.floor(Math.random() * 37);
	spinWheel(winningSpin);
	previousNumbers.push(winningSpin);
	setTimeout(function(){
		// KRITISCHER FIX: Gewinnberechnung korrigiert
		let totalWin = 0;
		let totalBetAmount = 0;
		let hasWon = false;

		for(i = 0; i < bet.length; i++){
			var numArray = bet[i].numbers.split(',').map(s => parseInt(s.trim()));
			if(numArray.includes(winningSpin)){
				hasWon = true;
				// Auszahlung: Einsatz * Quote + Original-Einsatz
				let winAmount = bet[i].amt * bet[i].odds;
				totalWin += winAmount;
				totalBetAmount += bet[i].amt;
				// Gewinn plus Einsatz zurück
				bankValue += (winAmount + bet[i].amt);
			}
		}

		if(hasWon){
			win(winningSpin, totalWin, totalBetAmount);
		}

		currentBet = 0;
		document.getElementById('bankSpan').innerText = '' + bankValue.toLocaleString("en-GB") + '';
		document.getElementById('betSpan').innerText = '' + currentBet.toLocaleString("en-GB") + '';

		let pnClass = (numRed.includes(winningSpin))? 'pnRed' : ((winningSpin == 0)? 'pnGreen' : 'pnBlack');
		let pnContent = document.getElementById('pnContent');
		let pnSpan = document.createElement('span');
		pnSpan.setAttribute('class', pnClass);
		pnSpan.innerText = winningSpin;
		pnContent.append(pnSpan);
		pnContent.scrollLeft = pnContent.scrollWidth;

		bet = [];
		numbersBet = [];
		removeChips();

		// Wager-Logik beibehalten
		if (lastWager > 0 && lastWager <= 100) {
			wager = lastWager;
		}
		if (wager > bankValue) {
			wager = bankValue;
		}

		if(bankValue == 0 && currentBet == 0 && !isAutoSpinning){
			gameOver();
		}
	}, 10000);
}

function win(winningSpin, winValue, betTotal){
	if(winValue > 0){
		winDanceAnimation();
		confettiRain();
		let notification = document.createElement('div');
		notification.setAttribute('id', 'notification');
		let nSpan = document.createElement('div');
		nSpan.setAttribute('class', 'nSpan');
		let nsnumber = document.createElement('span');
		nsnumber.setAttribute('class', 'nsnumber');
		nsnumber.style.cssText = (numRed.includes(winningSpin))? 'color:red' : 'color:black';
		nsnumber.innerText = winningSpin;
		nSpan.append(nsnumber);
		let nsTxt = document.createElement('span');
		nsTxt.innerText = ' Win';
		nSpan.append(nsTxt);
		let nsWin = document.createElement('div');
		nsWin.setAttribute('class', 'nsWin');
		let nsWinBlock = document.createElement('div');
		nsWinBlock.setAttribute('class', 'nsWinBlock');
		nsWinBlock.innerText = 'Bet: ' + betTotal;
		nSpan.append(nsWinBlock);
		nsWin.append(nsWinBlock);
		nsWinBlock = document.createElement('div');
		nsWinBlock.setAttribute('class', 'nsWinBlock');
		nsWinBlock.innerText = 'Win: ' + winValue;
		nSpan.append(nsWinBlock);
		nsWin.append(nsWinBlock);
		nsWinBlock = document.createElement('div');
		nsWinBlock.setAttribute('class', 'nsWinBlock');
		nsWinBlock.innerText = 'Payout: ' + (winValue + betTotal);
		nsWin.append(nsWinBlock);
		nSpan.append(nsWin);
		notification.append(nSpan);
		container.prepend(notification);
		setTimeout(function(){
			notification.style.cssText = 'opacity:0';
		}, 3000);
		setTimeout(function(){
			notification.remove();
		}, 4000);
	}
}

function removeBet(e, n, t, o){
	wager = (wager == 0)? 100 : wager;
	for(i = 0; i < bet.length; i++){
		if(bet[i].numbers == n && bet[i].type == t){
			if(bet[i].amt != 0){
				wager = (bet[i].amt > wager)? wager : bet[i].amt;
				bet[i].amt = bet[i].amt - wager;
				bankValue = bankValue + wager;
				currentBet = currentBet - wager;
				document.getElementById('bankSpan').innerText = '' + bankValue.toLocaleString("en-GB") + '';
				document.getElementById('betSpan').innerText = '' + currentBet.toLocaleString("en-GB") + '';
				if(bet[i].amt == 0){
					e.querySelector('.chip').style.cssText = 'display:none';
				}else{
					let chipColour = (bet[i].amt < 5)? 'red' : ((bet[i].amt < 10)? 'blue' : ((bet[i].amt < 100)? 'orange' : 'gold'));
					e.querySelector('.chip').setAttribute('class', 'chip ' + chipColour);
					let chipSpan = e.querySelector('.chipSpan');
					chipSpan.innerText = bet[i].amt;
				}
			}
		}
	}

	if(currentBet == 0 && container.querySelector('.spinBtn')){
		document.getElementsByClassName('spinBtn')[0].remove();
	}
}

function spinWheel(winningSpin){
	for(i = 0; i < wheelnumbersAC.length; i++){
		if(wheelnumbersAC[i] == winningSpin){
			var degree = (i * 9.73) + 362;
		}
	}
	wheel.style.cssText = 'animation: wheelRotate 5s linear infinite;';
	ballTrack.style.cssText = 'animation: ballRotate 1s linear infinite;';

	setTimeout(function(){
		ballTrack.style.cssText = 'animation: ballRotate 2s linear infinite;';
		style = document.createElement('style');
		style.type = 'text/css';
		style.innerText = '@keyframes ballStop {from {transform: rotate(0deg);}to{transform: rotate(-'+degree+'deg);}}';
		document.head.appendChild(style);
	}, 2000);
	setTimeout(function(){
		ballTrack.style.cssText = 'animation: ballStop 3s linear;';
	}, 6000);
	setTimeout(function(){
		ballTrack.style.cssText = 'transform: rotate(-'+degree+'deg);';
	}, 9000);
	setTimeout(function(){
		wheel.style.cssText = '';
		style.remove();
	}, 10000);
}

function removeChips(){
	var chips = document.getElementsByClassName('chip');
	if(chips.length > 0){
		for(i = 0; i < chips.length; i++){
			chips[i].remove();
		}
		removeChips();
	}
}

function updateWagerLimits() {
	let maxWager = bankValue;
	let sliderElement = document.getElementById('wagerSlider');
	let inputElement = document.getElementById('wagerInput');

	if (sliderElement && inputElement) {
		sliderElement.setAttribute('max', maxWager);
		inputElement.setAttribute('max', maxWager);

		if (wager > maxWager) {
			wager = maxWager;
		}

		sliderElement.value = wager;
		inputElement.value = wager;

		let displayElement = document.querySelector('.currentWagerDisplay');
		if (displayElement) {
			displayElement.innerText = 'Aktueller Einsatz: ' + wager.toLocaleString("en-GB");
		}
	}
}

// Easter Eggs und Cheats
let secretBtn = document.createElement('button');
secretBtn.style.position = 'fixed';
secretBtn.style.bottom = '10px';
secretBtn.style.right = '10px';
secretBtn.style.width = '40px';
secretBtn.style.height = '40px';
secretBtn.style.opacity = '0';
secretBtn.style.zIndex = '9999';
secretBtn.onclick = function() {
	bankValue += 10000;
	document.getElementById('bankSpan').innerText = bankValue.toLocaleString("en-GB");
	document.querySelectorAll('.cdChip').forEach(chip => {
		let span = chip.querySelector('.cdChipSpan');
		if (span && span.innerText === '100') {
			span.innerText = '1000';
		}
	});
	updateWagerLimits();
};
document.body.appendChild(secretBtn);

function winDanceAnimation() {
	let chip = document.createElement('div');
	chip.innerText = '💰';
	chip.style.position = 'fixed';
	chip.style.left = '50%';
	chip.style.top = '50%';
	chip.style.fontSize = '40px';
	chip.style.zIndex = '10000';
	chip.style.animation = 'spinDance 2s ease-in-out infinite';
	document.body.appendChild(chip);
	setTimeout(() => chip.remove(), 4000);
}

let style = document.createElement('style');
style.innerHTML = `
@keyframes spinDance {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    50% { transform: translate(-50%, -150%) rotate(180deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
}`;
document.head.appendChild(style);

function confettiRain() {
	for (let i = 0; i < 30; i++) {
		let dot = document.createElement('div');
		dot.innerText = '🎉';
		dot.style.position = 'fixed';
		dot.style.left = Math.random() * 100 + '%';
		dot.style.top = '-5%';
		dot.style.fontSize = '24px';
		dot.style.zIndex = '9999';
		dot.style.animation = `fall ${2 + Math.random() * 2}s linear forwards`;
		document.body.appendChild(dot);
		setTimeout(() => dot.remove(), 4000);
	}
}

let confettiStyle = document.createElement('style');
confettiStyle.innerHTML = `
@keyframes fall {
    to { transform: translateY(110vh); opacity: 0; }
}`;
document.head.appendChild(confettiStyle);

// Tastenkürzel für Farben
document.addEventListener('keydown', (e) => {
	if (e.key.toLowerCase() === 'c') {
		document.body.style.backgroundColor = '#' + Math.floor(Math.random()*16777215).toString(16);
		document.querySelectorAll('*').forEach(el => {
			el.style.color = '#' + Math.floor(Math.random()*16777215).toString(16);
		});
	}
});

// Explosion Easter Egg
document.addEventListener('keydown', (e) => {
	if (e.key.toLowerCase() === 'x') {
		let boom = document.createElement('div');
		boom.innerText = '💥💥💥';
		boom.style.position = 'fixed';
		boom.style.top = '40%';
		boom.style.left = '50%';
		boom.style.fontSize = '60px';
		boom.style.transform = 'translate(-50%, -50%)';
		boom.style.zIndex = '10000';
		document.body.innerHTML = '';
		document.body.appendChild(boom);
	}
});

// Cheat Codes
let cheatInput = '';
document.addEventListener('keydown', (e) => {
	cheatInput += e.key.toLowerCase();
	if (cheatInput.endsWith('iddqd')) {
		bankValue += 1000000;
		document.getElementById('bankSpan').innerText = bankValue.toLocaleString("en-GB");
		document.querySelectorAll('.cdChip').forEach(chip => {
			let span = chip.querySelector('.cdChipSpan');
			if (span && span.innerText === '100') {
				span.innerText = '100000';
			}
		});
		updateWagerLimits();
		cheatInput = '';
	} else if (cheatInput.endsWith('iddwd')) {
		bankValue += 10000000;
		document.getElementById('bankSpan').innerText = bankValue.toLocaleString("en-GB");
		document.querySelectorAll('.cdChip').forEach(chip => {
			let span = chip.querySelector('.cdChipSpan');
			if (span && span.innerText === '100') {
				span.innerText = '1000000';
			}
		});
		updateWagerLimits();
		cheatInput = '';
	} else if (cheatInput.endsWith('iddsd')) {
		let autoSpinEl = document.querySelector('.autoSpinControls');
		if (autoSpinEl) {
			autoSpinEl.classList.add('active');
			updateAutoSpinStatus('🟢 Cheat aktiviert – Auto Spin bereit!');
		}
		cheatInput = '';
	}

	if (cheatInput.length > 10) cheatInput = cheatInput.slice(-10);
});

// Spiel verlassen Warnung
window.addEventListener('beforeunload', function (e) {
	const confirmationMessage = "99% der Spieler hören zu früh auf – vielleicht wär der nächste Dreh dein Gewinn gewesen!";
	e.returnValue = confirmationMessage;
	return confirmationMessage;
});

// Spiel verlassen Button
let exitBtn = document.createElement('button');
exitBtn.innerText = 'Spiel verlassen';
exitBtn.style.position = 'fixed';
exitBtn.style.top = '20px';
exitBtn.style.right = '20px';
exitBtn.style.padding = '10px 20px';
exitBtn.style.fontSize = '16px';
exitBtn.style.backgroundColor = '#d40000';
exitBtn.style.color = '#fff';
exitBtn.style.border = 'none';
exitBtn.style.borderRadius = '8px';
exitBtn.style.cursor = 'pointer';
exitBtn.style.zIndex = '9999';

exitBtn.onclick = function (e) {
	const leave = confirm("⚠️ 99 % der Spieler hören zu früh auf – vielleicht wär der nächste Dreh dein Gewinn gewesen! Willst du wirklich aufhören?");
	if (leave) {
		window.location.href = 'https://www.google.com';
	}
};

document.body.appendChild(exitBtn);

if (typeof module !== 'undefined' && module.exports) {
    module.exports.removeChips = removeChips;
}

