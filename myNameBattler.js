
`use strict`;

//エリア情報
const p1NameIn = document.getElementById('p1-name-in');
const p1FavIn = document.getElementById('p1-fav-in');
const p2NameIn = document.getElementById('p2-name-in');
const p2FavIn = document.getElementById('p2-fav-in');
const p1NameOut = document.getElementById('p1-name-out');
const p1FavOut = document.getElementById('p1-fav-out');
const p1Img = document.getElementById('p1-img-box');
const p1HP = document.getElementById('p1-HP');
const p1HPbar = document.getElementById('p1-HP-bar');
const p1PW = document.getElementById('p1-PW');
const p1PWbar = document.getElementById('p1-PW-bar');
const p1DF = document.getElementById('p1-DF');
const p1DFbar = document.getElementById('p1-DF-bar');
const p1Luck = document.getElementById('p1-luck');
const p1Type = document.getElementById('p1-type');
const p2NameOut = document.getElementById('p2-name-out');
const p2FavOut = document.getElementById('p2-fav-out');
const p2Img = document.getElementById('p2-img-box');
const p2HP = document.getElementById('p2-HP');
const p2HPbar = document.getElementById('p2-HP-bar');
const p2PW = document.getElementById('p2-PW');
const p2PWbar = document.getElementById('p2-PW-bar');
const p2DF = document.getElementById('p2-DF');
const p2DFbar = document.getElementById('p2-DF-bar');
const p2Luck = document.getElementById('p2-luck');
const p2Type = document.getElementById('p2-type');
const consoleArea = document.getElementById('console-area');
const summaryArea = document.getElementById('summary');
const tweetArea = document.getElementById('tweet-area');
const p1Box = document.getElementById('p1-status');
const p2Box = document.getElementById('p2-status');

//変数
const HPmax = 99000, PWmax = DFmax = 9900;　//ステータスの最大値
const HPmin = 0, PWmin = DFmin = 100;　//ステータスの最小値
let attacker, receiver; //攻撃側と受け身側。
let player1 ={};//player1,player2のステータスを格納するオブジェクト
let player2 ={};
let flg; //どちらの攻撃ターンかの目安。毎ターン1ずつ加算。
let count = 0; //攻撃回数（結果発表用）
let isEnter = false; //エンターキーで操作できる状態かどうか

//player2用、アイテムリスト
const randItemArr = ['お酒', 'りんご', 'カレー', '卵', 'エナジードリンク', '猫', '札束','牛丼','きゅうり','ちくわ','どら焼き'];

//運(luck.criticalは会心の一撃が出る確率)
const luck = { 
    luck1: { mark: '〇', critical: 0.2 },
    luck2: { mark: '△', critical: 0.15 },
    luck3: { mark: '×', critical: 0.1 }
}

//属性
const type = {
    type1: { name: '勇者', how: 'をひとかじりした', id: 0, img: 'img/type1.png' },
    type2: { name: '武闘家', how: 'をブンブン振り回した', id: 1, img: 'img/type2.png' },
    type3: { name: '魔法使い', how: 'を握りしめ呪文を唱えた', id: 2, img: 'img/type3.png' }
}

//COMキャラ一覧
const com = {
    com1: { name: '福沢諭吉', item: '1万円札' },
    com2: { name: '空海', item: '筆' },
    com3: { name: '毛利元就', item: '三本の矢' },
}

//アイテムタイプ
const item = {
    item1: {
        name: '気合',
        msg: '{attacker}の体力が10000上昇した',
        effect: function () {
            attacker.HP += 10000;
            attacker.HP = Math.max(HPmin, Math.min(HPmax, attacker.HP));//最大値と最小値の間で
        }
    },
    item2: {
        name: '忍耐',
        msg: '{attacker}の防御力が1500上がった',
        effect: function () {
            attacker.DF += 1500;
            attacker.DF = Math.max(DFmin, Math.min(DFmax, attacker.DF));//最大値と最小値の間で
        }
    },
    item3: {
        name: '攪乱',
        msg: 'なんと、お互いの体力が入れ替わった',
        effect: function () {//分割代入(https://javascript.programmer-reference.com/js-value-replacement/)
            [attacker.HP, receiver.HP] = [receiver.HP, attacker.HP];
        }
    },
    item4: {
        name: '畏怖',
        msg: '恐れをなした{receiver}の防御力が1500下がった',
        effect: function () {
            receiver.DF -= 1500;
            receiver.DF = Math.min(DFmax, Math.max(DFmin, receiver.DF));//最大値と最小値の間で
        }
    },
    item5: {
        name: '覚醒',
        msg: '{attacker}の攻撃力が1000上がった',
        effect: function () {
            attacker.PW += 1500;
            attacker.PW = Math.max(PWmin, Math.min(PWmax, attacker.PW));//最大値と最小値の間で
        }
    },
    item6: {
        name: '吸収',
        msg: '{receiver}の体力を5000吸い取った',
        effect: function () {
            receiver.HP -= 5000;
            attacker.HP += 5000;
            attacker.HP = Math.max(HPmin, Math.min(HPmax, attacker.HP));//最大値と最小値の間で
        }
    },
    item7: {
        name: '神風',
        msg: '{receiver}に10000のダメージを与えた',
        effect: function () {
            receiver.HP -= 10000;
        }
    }
}


//player1入力情報の受け取り
function p1submit() {
    //空欄禁止
    if (p1NameIn.value.length === 0) {  
        alert('名前を入力してください。'); 
        return;
    }　
    //スペース禁止
    if(p1NameIn.value.slice( 0, 1 ) === ' ' || p1NameIn.value.slice( 0, 1 ) === '　'){
        alert('一文字目がスペースはダメです。(自分の名前)'); 
        return;
    }
    player1.name = p1NameIn.value;
    player1.item = p1FavIn.value;
    nextSection(2); //次のセクションに移動
}


//pleyer2の好物をランダムで入力してあげる
function autoFav() {
    let i = Math.floor(Math.random() * randItemArr.length);
    p2FavIn.value =  randItemArr[i];
}

//player2入力情報の受け取り
function p2submit() {
    if (p2NameIn.value.length === 0) {  //空欄禁止
        alert('名前を入力してください。'); 
        return; 
    }
    if(p2NameIn.value.slice( 0, 1 ) === ' ' || p2NameIn.value.slice( 0, 1 ) === '　'){
        alert('一文字目がスペースはダメです。(対戦相手の名前)'); 
        return;
    }
    player2.name = p2NameIn.value;
    player2.item = p2FavIn.value;
    nextSection(3); //次のセクションに移動
    readyBattle(); //戦闘準備関数を実行
}


/**
 * 用意されたCOMプレイヤーを選択した場合の処理
 * @param {number} i html側に記載の番号
 */
function comChoose(i) {
    if(player1.name === undefined){
        alert('まずは自分の名前を入力してください。'); 
        return;
    }
    switch (i) {
        case 1: player2 = com.com1; break;
        case 2: player2 = com.com2; break;
        case 3: player2 = com.com3; break;
    }
    nextSection(3); //次のセクションに移動
    readyBattle(); //戦闘準備関数を実行
}

//section3用-戦闘準備
function readyBattle(){
    //余計なものを消しておく
    removeAllChildren(consoleArea);
    removeAllChildren(summaryArea);

    //戦闘力分析
    statusAssessment(player1);
    statusAssessment(player2);

    //ステータスを画面に反映
    carrentStatusOut();

    //開会の言葉
    const msg1 = dom('li', `${player1.name} vs ${player2.name}のバトルだ！`,'nomal');
    const msg2 = dom('li', 'まずは先攻後攻を決めるぞ！どちらかのカードをクリックしてくれ。', 'sub');
    consoleArea.appendChild(msg1);
    consoleArea.appendChild(msg2);

    //先攻後攻カード表示
    const card1 = dom('div', null, 'back');
    card1.id = "card1";
    card1.onclick = () => { shake(0); }; //クリックしたらカードめくりを実行
    const card2 = dom('div', null, 'back');
    card2.id = "card2"
    card2.onclick = () => { shake(1); }; //クリックしたらカードめくりを実行
    consoleArea.appendChild(card1);
    consoleArea.appendChild(card2);
}


/**
 * カードで先攻を決める
 * @param {number} num DOM生成したカードに記載の番号。左右どちらのカードを選んだか。
 */
function shake(num) {
    //ランダムでどちらのカードが先攻のカードになるかを決める。　
    let rand;
    Math.random() < 0.5 ? rand = 0 : rand = 1;

    const card1 = document.getElementById('card1');
    const card2 = document.getElementById('card2');
    let deg = 180;//めくったときに文字が逆になっちゃうので、初期値を180度に。

    //カードをめくる関数
    let rotateCard = function () {
        deg += 6;
        if (180 <= deg && deg < 270) {
            card1.className = card2.className = 'back';
        } else if (deg <= 360 && rand === 0) { //半分めくれたときにクラスを付与
            card1.className = 'face first';
            card2.className = 'face second';
        } else if (deg <= 360 && rand === 1) {
            card1.className = 'face second';
            card2.className = 'face first';
        } else {
            clearInterval(cardInterval);　//360度までめくったら終了
        }
        card1.style.transform = `rotateY(${deg}deg)`;
        card2.style.transform = `rotateY(${deg}deg)`;
    }
    //カードをめくる関数を連続的に実行
    let cardInterval = setInterval(rotateCard, 30);

    //先攻後攻を宣言する関数を準備
    let output = function () {
        let msg;
        rand === num　//選んだカードが先行カードかどうか
            ? (msg = dom('li', `${player1.name}の先攻だ！`,'nomal'), flg = 0)
            : (msg = dom('li', `${player2.name}の先攻だ！`,'nomal'), flg = 1)
            ;
        consoleArea.appendChild(msg);

        //キー説明
        let msg2 = dom('li', 'この後は、Enterキーか、この黒いエリアをタップでゲームが進行します。', 'sub');
        let triangle = dom('p','▼','triangle','nomal'); //コメント送りマーク
        consoleArea.appendChild(msg2);
        consoleArea.appendChild(triangle);
        isEnter = true;　//この後はエンターキーを受け入れ
    }

    //カードがめくり終わるのを待って先攻後攻を宣言
    setTimeout(output, 900);
}


/**
 * 攻撃ターンにやること
 * https://laboradian.com/js-wait/ 順に処理。この記事を参考にしました。
 */
async function nextAttack() {
    isEnter = false; //連打防止
    try {
        count++;　//攻撃回数をカウント（結果報告用）
        removeAllChildren(consoleArea);

        //アタッカーを判別
        flg %= 2;
        flg === 0 ?
            (attacker = player1, receiver = player2, consoleArea.className = "p1-turn") :
            (attacker = player2, receiver = player1, consoleArea.className = "p2-turn");

        //アイテム利用判定
        if (attacker.item !== "" && Math.random() <= 0.2) { //20%の確率でアイテムを利用
            attacker.itemCount++;　//対戦結果に使う用にアイテムの使用回数をカウント
            attacker.itemType.effect(); //アイテムタイプ固有の効果を発揮
            let msg1 = dom('li', `${attacker.name}は${attacker.item}${attacker.Type.how}`,'nomal');
            let msg2 = dom('li', attacker.itemType.msg.replace(/\{attacker\}/g, attacker.name).replace(/\{receiver\}/g, receiver.name),'nomal');
            consoleArea.appendChild(msg1);
            await wait(0.5); //ちょっと待つ(演出上の問題で特に意味はない)
            consoleArea.appendChild(msg2);
            carrentStatusOut();//ステータスを出力
            await wait(1); //ちょっと待つ(演出上の問題で特に意味はない)
        }

        //通常攻撃宣言
        let msg1 = dom('li', `${attacker.name}の攻撃`,'nomal');
        consoleArea.appendChild(msg1);
        await wait(0.5); //ちょっと待つ(演出上の問題で特に意味はない)

        //基礎ダメージを算出
        let damage = baseDamage(attacker, receiver);
   
        //クリティカル判定
        if(attacker.Luck.critical >= Math.random()){
            damage *= 1.5;
            let msg = dom('li','会心の一撃！','nomal');
            consoleArea.appendChild(msg);
            await wait(0.5); //ちょっと待つ(演出上の問題で特に意味はない)
        }

        //相性補正
        damage = Math.floor(damage * match(attacker, receiver));

        //最終ダメージを相手から減算
        receiver.HP -= damage;

        //ステータスエリアを赤くしてダメージをうけた演出をcssで行う
        cssChange();
        
        //戦闘結果を出力
        let msg2 = dom('li', `${receiver.name}は${damage}のダメージを受けた。`,'nomal');
        let triangle = dom('p', '▼', 'triangle');
        consoleArea.appendChild(msg2);
        consoleArea.appendChild(triangle);

        //死亡判定
        if (receiver.HP <= 0) {
            isEnter = false;
            receiver.HP = HPmin;　//マイナスの値を書き出さないように
            let msg = dom('li', `${receiver.name}は力尽きた・・・`,'nomal');
            consoleArea.appendChild(msg);
            setTimeout(result, 1000, attacker, receiver); //1秒後に結果発表へ
        }

        carrentStatusOut();//ステータスを出力
        flg++; //攻撃ターンを入れ替え

    } catch (err) {
        console.error(err);
    }
    isEnter = true; //エンターキーで次の攻撃へ
}

//結果発表
function result(attacker) {
    isEnter = false; //エンターキーはもう無効
    nextSection(4);　//最終エリアへ画面を移動

    //戦闘結果を文章化(改行したくなかったので・・・)
    let summary = `${player1.name}(HP${player1.HP1}/PW${player1.PW1}/DF${player1.DF1})と${player2.name}(HP${player2.HP1}/PW${player2.PW1}/DF${player2.DF1})の戦いは${count}回の激しい打ち合いの末、${attacker.name}が勝った。`;

    let msg1 = dom('p', summary, 'nomal'); 
    summaryArea.appendChild(msg1);

    let summary2;
    if (attacker.itemCount > 0) {
        summary2 = `\n${attacker.item}${attacker.Type.how}${attacker.name}は強かった。`;
        summary += summary2; //SNS用
        let msg2 = dom('p', summary2,'nomal');
        summaryArea.appendChild(msg2);
    }
    
    //sns投稿ボタンを作成
    tweet(summary);
    line(summary);
}

//ツイートボタン作成
function tweet(summary) {
    const anchor = dom('a','Tweet #マイネームバトラー','twitter-hashtag-button');
    const hrefValue =
    `https://twitter.com/intent/tweet?button_hashtag=${encodeURIComponent('マイネームバトラー') }&ref_src=twsrc%5Etfw`;
    anchor.setAttribute('href', hrefValue);
    anchor.setAttribute('data-text', `${summary} https://grawo0916.github.io/MyNameBattler/`);
    anchor.setAttribute('data-size',"small");
    tweetArea.appendChild(anchor);
    const script = dom('script','','nomal');
    script.setAttribute('src', 'https://platform.twitter.com/widgets.js');
    tweetArea.appendChild(script);
}
//ラインボタン作成
function line(summary){
    const text = `${summary}マイネームバトラー（https://grawo0916.github.io/MyNameBattler/）`;
    const anchor = dom('a','<img src="img/wide-default.png" />','line-button');
    const hrefValue = `http://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    anchor.setAttribute('href' , hrefValue);
    tweetArea.appendChild(anchor);
}

/**
 * 診断系
 */

//戦闘力診断（参考:http://barcodebattler.net/page12.htm)
function statusAssessment(obj) {
    //コードを全部足す
    let sumOfCharCode = 0;
    let strArr = [];
    for (let i = 0; i < obj.name.length; i++) {
        sumOfCharCode += obj.name.charCodeAt(i);
    }
    while(sumOfCharCode < 100000){　//6桁に満たないときは累乗
        sumOfCharCode **=2;
    }
    let str = String(sumOfCharCode); //文字列として
    for (let i = 0; i < str.length; i++) {
         strArr.push(str.slice(i,i+1)); //1桁ずつ取り出す
    }
    //ステータスを決定
    obj.HP = obj.HP1 = parseInt(`${strArr[1]}${strArr[3]}000`);
    obj.PW = obj.PW1 = parseInt(`${strArr[2]}${strArr[5]}00`);
    obj.DF = obj.DF1 = parseInt(`${strArr[0]}${strArr[4]}00`);
    obj.Luck = luckAssess(sumOfCharCode % 3);
    obj.Type = typeAssess(strArr[3] % 3);
    obj.itemCount = 0;
    obj.itemType = itemAssessment(obj);
}

//アイテム診断
function itemAssessment(obj){
    if(obj.item ===""){return};
    let sumOfCharCode = 0;
    for (let i = 0; i < obj.item.length; i++) {
        sumOfCharCode += obj.item.charCodeAt(i);
    }
    let num = sumOfCharCode % 6;
    switch(num){
        case 0: return item.item1;
        case 1: return item.item2;
        case 2: return item.item3;
        case 3: return item.item4;
        case 4: return item.item5;
        case 5: return item.item6;
        case 6: return item.item7;
    }
}

//運診断
function luckAssess(num){
    switch (num) {
        case 0: return luck.luck1;
        case 1: return luck.luck2;
        case 2: return luck.luck3;
    }
}

//属性診断
function typeAssess(num){
    switch (num) {
        case 0: return type.type1;
        case 1: return type.type2;
        case 2: return type.type3;
    }
}

/**
 * 基礎ダメージ診断
 *  @return {number}　基礎ダメージ数値
 */
function baseDamage(attacker, receiver) {
    let damage = (attacker.PW * 3) + (attacker.PW * Math.random());
    damage = Math.floor(damage - receiver.DF) / 2;
    damage = Math.min(PWmax * 3, Math.max(1000, damage));//最低でも1000
    return damage;
}

//
/**
 * 相性診断
 * この記事を参考にしました。https://qiita.com/mpyw/items/3ffaac0f1b4a7713c869
 */
function match(attacker, receiver) {
    //Type.idは0,1,2のどれかが割り当てられている。
    let x = (attacker.Type.id - receiver.Type.id + 3) % 3;
    switch (x) {
        case 0: return 1;   //あいこ　
        case 1: return 0.8; //劣勢　ダメージ2割引き
        case 2: return 1.2; //優勢　ダメージ2割増し
    }
}

//攻撃を受けたときにステータスが赤くなるcss表現
function cssChange(){
    let box;
    flg === 0? box = p2Box : box = p1Box;
    box.classList.add('red');
    setTimeout(() => {
        box.classList.remove('red');
    }, 500);
}


//エンターキーでゲーム進行
window.document.onkeydown = function (event) {
    if (isEnter === true && event.key === 'Enter') {
        nextAttack();
    }
}
//クリックでゲーム進行
consoleArea.onclick = function (event) {
    if (isEnter === true) {
        nextAttack();
    }
}

//次のセクションへスクロール
function nextSection(i) {
    let next = document.getElementById(`section${i}`);
    next.scrollIntoView({ behavior: "smooth" })
}

//ステータスを画面に反映
function carrentStatusOut(){
    p1NameOut.innerText = player1.name;
    p1FavOut.innerText = player1.item;
    p1Img.innerHTML = `<img src = "${player1.Type.img}">`
    p1HP.innerText = player1.HP;
    p1HPbar.style.width = `${(player1.HP/99900*100)}%`;
    p1PW.innerText = player1.PW;
    p1PWbar.style.width = `${(player1.PW/9900*100)}%`;
    p1DF.innerText = player1.DF;
    p1DFbar.style.width = `${(player1.DF/9900*100)}%`;
    p1Luck.innerText = player1.Luck.mark;
    p1Type.innerText = player1.Type.name;
    p2NameOut.innerText = player2.name;
    p2FavOut.innerText = player2.item;
    p2Img.innerHTML = `<img src = "${player2.Type.img}">`
    p2HP.innerText = player2.HP;
    p2HPbar.style.width = `${(player2.HP/99900*100)}%`;
    p2PW.innerText = player2.PW;
    p2PWbar.style.width = `${(player2.PW/9900*100)}%`;
    p2DF.innerText = player2.DF;
    p2DFbar.style.width = `${(player2.DF/9900*100)}%`;
    p2Luck.innerText = player2.Luck.mark;
    p2Type.innerText = player2.Type.name;
}

//DOM要素を生成
function dom(tag,html,className){
    let element = document.createElement(tag);
    element.innerHTML = html;
    element.className = className;
    return element;
}

//子要素を全て削除
function removeAllChildren(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
}

/**
 * 一定時間待つ関数
 * この記事を参考にしました。https://laboradian.com/js-wait/
 */
const wait = (sec) => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, sec*1000);
    });
};


//もう一回遊ぶボタン
function retry(){
    nextSection(1);
    document.location.reload();
}

//リロード時はトップから
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}


//説明書のモーダル表示
const btn = document.getElementById('btn');
const modal = document.getElementById('modal');
btn.addEventListener('click', function () {
    modal.style.display = 'block';
})
const closeBtn = document.getElementById('closeBtn');
closeBtn.addEventListener('click', function () {
    modal.style.display = 'none';
})
window.addEventListener('click', function (e) {
    if (e.target == modal) {
        modal.style.display = 'none';
    }
});
