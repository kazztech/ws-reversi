canvas.addEventListener("click", (e) => {
    let x, y;
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    if (width * 1.4 < height) {
        let p = 640 / width;
        x = Math.floor(e.pageX * p);
        y = Math.floor((e.pageY - (height - width * 1.4) / 2) * p);
    } else {
        let p = 896 / height;
        x = Math.floor((e.pageX - (width - height / 1.4) / 2) * p);
        y = Math.floor(e.pageY * p);
    }
    // ボードのクリック判定
    if (20 <= x && x < 620 && 148 <= y && y < 748 && isTurn) {
        let posX = Math.floor((x - 20) / 75);
        let posY = Math.floor((y - 148) / 75);
        socket.emit("put-piece", {
            x: posX,
            y: posY
        });
    }
    // EXITボタン
    if (
        (y >= -7 / 11 * x + 9160 / 11) &&
        (y <= 5 / 11 * x + 8920 / 11) &&
        x < 75
    ) {
        if (window.confirm("ルームを退出してもよろしいですか？")) {
            window.location.href = location.origin;
        }
    }
    if ((565 <= x && x < 598) && (55 <= y && y < 110)) {
        document.addEventListener("copy", (e) => {
            e.clipboardData.setData("text/plain", location.href);
            e.preventDefault();
        });
        document.execCommand("copy");
        window.alert("共有用リンクをコピーしました");
    }
});