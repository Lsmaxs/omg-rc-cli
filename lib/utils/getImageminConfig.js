module.exports = function getImageminConfig() {
    return {
        mozjpeg: {
            progressive: true,
            quality: 75
        },
        optipng: {
            enabled: false,
        },
        pngquant: {
            quality: [0.7, 0.90],
            speed: 4
        },
        gifsicle: {
            interlaced: false,
        },
        // svgo@3 的 plugins 配置格式已更新
        svgo: {
            plugins: [
                {
                    name: 'removeViewBox',
                    active: false,
                },
                {
                    name: 'removeEmptyAttrs',
                    active: false,
                },
            ],
        }
    }
}
