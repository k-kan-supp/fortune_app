/** 日本語メッセージ。英語 (en.ts) はこの構造に従う（型で強制）。 */
export const ja = {
  app: {
    title: "四柱推命",
  },

  lang: {
    label: "言語",
    ja: "日本語",
    en: "English",
  },

  nav: {
    discover: "さがす",
    matches: "マッチ",
    fortune: "占い",
    settings: "設定",
    logout: "ログアウト",
  },

  common: {
    loading: "読み込み中…",
    send: "送信",
    cancel: "キャンセル",
    save: "保存する",
    remove: "削除",
    unnamed: "名称未設定",
    noImage: "No Image",
    notSelected: "未選択",
    any: "指定なし",
    /** 「28歳・東京都・会社員」のように項目を並べるときの区切り。 */
    metaSeparator: "・",
  },

  errors: {
    fetch: "取得に失敗しました。",
    send: "送信に失敗しました。",
    unknown: "不明なエラー",
    generic: "エラーが発生しました。",
  },

  fortune: {
    heroTitle: "無料 四柱推命 鑑定",
    heroSub: "生年月日から、生まれ持った四つの柱を読み解きます。",
    stepBadge: "ステップ {{n}}",
    steps: {
      input: {
        title: "生年月日を入力",
        body: "生まれた年月日と時刻を入れるだけ。登録なしですぐに鑑定できます。",
      },
      chart: {
        title: "命式を読み解く",
        body: "四つの柱に並ぶ天干・地支・蔵干から、生まれ持った性質を確かめましょう。",
      },
      meet: {
        title: "縁のある人と出会う",
        body: "プロフィールに生年月日を保存すると、相性の良い相手をさがせます。",
      },
    },
    /** トップページで入力フォームを開くボタン。 */
    startCta: "鑑定する",
    prefillNote: "プロフィールの生年月日を反映しました。",
    prefillEdit: "編集する",
    resultTitle: "あなたの命式",
    resultHint: "日主を中心に、四柱の干支と蔵干を並べています。",
    toProfile: "プロフィール設定 →",
    toRegister: "ユーザー登録して生年月日を保存 →",
    form: {
      dateTitle: "生まれた年・月・日を教えてください。",
      dateNote: "西暦で入力してください。命式はこの日付から組み立てます。",
      year: "年",
      month: "月",
      day: "日",
      timeTitle: "生まれた時刻はわかりますか。",
      timeNote: "時柱に使います。わからない場合は 12 時のままで構いません。",
      hour: "時",
      submit: "鑑定する",
      submitting: "鑑定中…",
    },
    table: {
      dayMaster: "日主",
      yearPillar: "年柱",
      monthPillar: "月柱",
      dayPillar: "日柱",
      hourPillar: "時柱",
      stem: "天干",
      branch: "地支",
      hiddenStems: "蔵干",
    },
  },

  register: {
    title: "ユーザー登録",
    hint: "メールアドレスに登録用リンクをお送りします。",
    submit: "登録用リンクを送る",
    sending: "送信中…",
    sentHint: "メールが届かない場合は、迷惑メールフォルダをご確認ください。",
  },

  verify: {
    verifying: "登録を確認しています…",
    successTitle: "登録が完了しました 🎉",
    loggedInAs: "{{email}} でログインしました。",
    toFortune: "四柱推命を鑑定する →",
    errorTitle: "確認できませんでした",
    retry: "登録をやり直す",
    missingToken: "トークンがありません。",
    failed: "検証に失敗しました。",
  },

  discover: {
    title: "さがす",
    pass: "スキップ",
    like: "いいね",
    empty: "条件に合う候補がいません。絞り込みを変えてみてください。",
    matchedTitle: "マッチしました 🎉",
    matchedBody: "{{name}} さんとマッチしました。",
    toMessages: "メッセージを送る",
    keepBrowsing: "続けてさがす",
    someone: "お相手",
  },

  filter: {
    open: "絞り込み",
    close: "絞り込みを閉じる",
    gender: "性別",
    age: "年齢",
    minAge: "下限",
    maxAge: "上限",
    area: "エリア",
    reset: "リセット",
    apply: "この条件でさがす",
  },

  matches: {
    title: "マッチ",
    empty: "まだマッチはありません。「さがす」からいいねしてみましょう。",
    mine: "自分: ",
    image: "📷 画像",
    noMessages: "メッセージを送ってみましょう",
  },

  chat: {
    back: "← マッチ一覧",
    backToList: "← マッチ一覧へ",
    noMatch: "マッチが指定されていません。",
    placeholder: "メッセージを入力",
    connecting: "接続中…",
    sendImage: "画像を送る",
    read: "既読",
    imageFailed: "画像の送信に失敗しました。",
    connectionError: "接続エラーが発生しました。",
    notConnected: "接続していません。少し待って再試行してください。",
  },

  chatMenu: {
    menu: "メニュー",
    report: "通報する",
    block: "ブロックする",
    blockConfirm: "このユーザーをブロックしますか？ マッチとチャットは表示されなくなります。",
    blockFailed: "ブロックに失敗しました。",
    reportTitle: "通報",
    reason: "理由",
    reasons: {
      inappropriate: "不適切なメッセージ",
      impersonation: "なりすまし・業者の疑い",
      photoMismatch: "写真と本人が違う",
      other: "その他",
    },
    detail: "詳細（任意）",
    reportThanks: "通報を受け付けました。ご協力ありがとうございます。",
    reportFailed: "通報に失敗しました。",
  },

  profile: {
    title: "プロフィール設定",
    blockedLink: "ブロックしたユーザー",
    toFortune: "← 四柱推命を鑑定する",
    saved: "保存しました ✓",
    sections: {
      basic: "基本情報",
      physical: "身体・基本スペック",
      details: "プロフィール詳細",
      about: "自己紹介",
    },
    fields: {
      displayName: "表示名",
      birthday: "生年月日",
      birthTime: "出生時刻",
      gender: "性別",
      height: "身長",
      weight: "体重",
      bodyType: "体型",
      bloodType: "血液型",
      occupation: "職業",
      education: "学歴",
      prefecture: "居住地",
      maritalStatus: "婚姻歴",
      smoking: "喫煙",
      drinking: "飲酒",
    },
    bioPlaceholder: "自己紹介を入力してください（1000文字まで）",
  },

  avatar: {
    alt: "アイコン",
    choose: "画像を選択",
  },

  blocked: {
    title: "ブロックしたユーザー",
    empty: "ブロック中のユーザーはいません。",
    unblock: "解除",
    unblockFailed: "解除に失敗しました。",
    back: "← 設定へ戻る",
  },

  candidate: {
    age: "{{age}}歳",
  },

  options: {
    gender: {
      male: "男性",
      female: "女性",
      other: "その他",
    },
    bodyType: {
      slim: "細身",
      average: "普通",
      muscular: "筋肉質・がっちり",
      plump: "ぽっちゃり",
    },
    /** 候補カードなど、幅の狭い場所で使う短い表記。 */
    bodyTypeShort: {
      slim: "細身",
      average: "普通",
      muscular: "筋肉質",
      plump: "ぽっちゃり",
    },
    bloodType: {
      A: "A型",
      B: "B型",
      O: "O型",
      AB: "AB型",
    },
    education: {
      high_school: "高校",
      vocational: "専門学校",
      junior_college: "短大",
      university: "大学",
      graduate: "大学院",
    },
    maritalStatus: {
      single: "未婚",
      married: "既婚",
      divorced: "離婚",
    },
    smoking: {
      no: "吸わない",
      yes: "吸う",
      sometimes: "時々吸う",
      quit: "やめた",
    },
    drinking: {
      no: "飲まない",
      yes: "飲む",
      sometimes: "時々飲む",
    },
  },
};

/** 各言語のメッセージが満たすべき型（葉はすべて string）。 */
export type Messages = typeof ja;
