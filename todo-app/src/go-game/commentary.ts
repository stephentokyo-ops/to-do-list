import type { GameState, Position, Commentary, StoneColor } from './types';
import { BOARD_SIZE, getNeighbors, getGroup, getGroupLiberties } from './gameLogic';

function isCorner(pos: Position): boolean {
  return (
    (pos.row <= 2 || pos.row >= BOARD_SIZE - 3) &&
    (pos.col <= 2 || pos.col >= BOARD_SIZE - 3)
  );
}

function isSide(pos: Position): boolean {
  return (
    pos.row <= 1 ||
    pos.row >= BOARD_SIZE - 2 ||
    pos.col <= 1 ||
    pos.col >= BOARD_SIZE - 2
  );
}

function isCenter(pos: Position): boolean {
  return pos.row >= 3 && pos.row <= 5 && pos.col >= 3 && pos.col <= 5;
}

function getCornerName(pos: Position): string {
  if (pos.row <= 2 && pos.col <= 2) return '左上の隅';
  if (pos.row <= 2 && pos.col >= 6) return '右上の隅';
  if (pos.row >= 6 && pos.col <= 2) return '左下の隅';
  return '右下の隅';
}

function createsAtari(newBoard: GameState['board'], pos: Position, opponent: StoneColor): boolean {
  for (const n of getNeighbors(pos)) {
    if (newBoard[n.row][n.col] === opponent) {
      const group = getGroup(newBoard, n);
      const libs = getGroupLiberties(newBoard, group);
      if (libs.length === 1) return true;
    }
  }
  return false;
}

function connectsMultipleGroups(
  prevBoard: GameState['board'],
  pos: Position,
  color: StoneColor
): boolean {
  const seen = new Set<string>();
  let groupCount = 0;
  for (const n of getNeighbors(pos)) {
    if (prevBoard[n.row][n.col] === color) {
      const group = getGroup(prevBoard, n);
      const key = group.map(p => `${p.row},${p.col}`).sort().join('|');
      if (!seen.has(key)) {
        seen.add(key);
        groupCount++;
      }
    }
  }
  return groupCount >= 2;
}

const TIPS = [
  '囲碁の基本：「隅→辺→中央」の順に陣地を広げるのが効率的です。',
  'ヒント：相手の石のダメ（隣の空点）が1つになった状態を「アタリ」と言います。アタリを見逃さないようにしましょう！',
  '石をバラバラに置くより、つなげることで強くなります。',
  '相手の石が弱い場所を攻め、自分の石が弱い場所を守ることが大切です。',
  '囲碁は「地（陣地）」を争うゲーム。終局時に空点が多い方が勝ちです。',
  '序盤は効率よく陣地の骨格を作ることが重要です。',
];

export function generateCommentary(
  prevState: GameState,
  newBoard: GameState['board'],
  pos: Position,
  captured: Position[],
  isPlayerMove: boolean
): Commentary {
  const { currentPlayer: color, moveCount } = prevState;
  const opponent: StoneColor = color === 'black' ? 'white' : 'black';

  // Captures (highest priority)
  if (captured.length > 0) {
    if (isPlayerMove) {
      if (captured.length >= 4) {
        return {
          text: `大捕獲！${captured.length}個の白石を取りました！一気に差をつけましたね。取った石はゲーム終了時にスコアに加算されます。`,
          type: 'good',
        };
      }
      if (captured.length >= 2) {
        return {
          text: `${captured.length}個の石を取りました！上手い！相手の石のダメを全て塞ぐことで取ることができます。`,
          type: 'good',
        };
      }
      return {
        text: `1個の白石を取りました！石を取ったら相手の石があった場所が空になり、後で陣地になる可能性があります。`,
        type: 'good',
      };
    } else {
      if (captured.length >= 3) {
        return {
          text: `AIが${captured.length}個のあなたの石を取りました。石を守るために、常に自分の石のダメ（空点）の数を確認しましょう。`,
          type: 'warning',
        };
      }
      return {
        text: `AIが${captured.length}個の石を取りました。ダメが1つしかない状態（アタリ）になったら、逃げるか別の手を打ちましょう。`,
        type: 'warning',
      };
    }
  }

  // Atari creation
  if (createsAtari(newBoard, pos, opponent)) {
    if (isPlayerMove) {
      return {
        text: `アタリ！相手の石のダメが1つだけになりました。次の手でその石を取れます。見逃さないように！`,
        type: 'good',
      };
    } else {
      return {
        text: `AIがアタリをかけました！あなたの石のダメが1つになっています。逃げるか、他の場所で反撃を考えましょう。`,
        type: 'warning',
      };
    }
  }

  // Opening phase commentary
  if (moveCount < 6 && isPlayerMove) {
    if (isCorner(pos)) {
      const cornerName = getCornerName(pos);
      return {
        text: `${cornerName}に打ちました！序盤の定石です。隅は三方が盤の外なので、少ない石で大きな陣地を確保できます。プロ棋士も必ず序盤に隅を打ちます。`,
        type: 'good',
      };
    }
    if (isSide(pos)) {
      return {
        text: `辺に打ちました。辺も悪くはありませんが、まだ隅が空いている場合は先に隅を打つ方が効率的です。隅→辺→中央が序盤の基本順です。`,
        type: 'tip',
      };
    }
    if (isCenter(pos)) {
      return {
        text: `中央に打ちました。序盤の中央は影響力が大きいですが、陣地になりにくいです。まずは隅や辺を固めてから中央を考えましょう。`,
        type: 'tip',
      };
    }
  }

  // AI opening commentary
  if (moveCount < 6 && !isPlayerMove) {
    if (isCorner(pos)) {
      return {
        text: `AIが隅に打ちました。囲碁の序盤は隅が最も重要です。三方が盤の外なので囲いやすく、効率よく陣地を作れます。`,
        type: 'info',
      };
    }
  }

  // Stone connection
  if (isPlayerMove && connectsMultipleGroups(prevState.board, pos, color)) {
    return {
      text: `複数の石をつなぎました！「連（れん）」を作ることでダメが増え、石が強くなります。石の連携は囲碁の基本です。`,
      type: 'good',
    };
  }

  // Mid-game tips
  if (moveCount > 10) {
    const tip = TIPS[moveCount % TIPS.length];
    if (isPlayerMove) {
      return { text: tip, type: 'tip' };
    }
  }

  // Default
  if (isPlayerMove) {
    return { text: '石を打ちました。周りの石との関係（ダメの数、つながり）を意識してみましょう。', type: 'info' };
  }
  return { text: 'AIが手を打ちました。AIの石の配置からも学べることがあります。', type: 'info' };
}
