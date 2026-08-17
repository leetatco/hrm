// cloudfunctions/getImagesBase64/index.js
module.exports = {
    main: async (event) => {
        const { data = {} } = event;
        const { imageUrls = [] } = data;

        // 参数校验
        if (!imageUrls || imageUrls.length === 0) {
            return { code: 1, msg: '图片URL列表不能为空' };
        }

        const { util } = event;
        const { vk } = util;

        // 定义 MIME 映射
        const mimeMap = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'webp': 'image/webp'
        };

        // 批量处理每个 URL
        const results = [];
        for (const url of imageUrls) {
            try {
                // 1. 使用 vk.downloadFile 下载图片
                const downloadRes = await vk.downloadFile({ fileID: url });
                // downloadRes.fileContent 是 Buffer

                // 2. 转为 base64
                const base64 = downloadRes.fileContent.toString('base64');

                // 3. 确定图片 MIME 类型（从 URL 后缀）
                let mime = 'image/png'; // 默认
                const extMatch = url.match(/\.(png|jpe?g|gif|webp)$/i);
                if (extMatch) {
                    const ext = extMatch[1].toLowerCase();
                    mime = mimeMap[ext] || mime;
                }

                // 4. 拼接 data:image 前缀
                const dataUrl = `data:${mime};base64,${base64}`;
                results.push({
                    url,
                    base64: dataUrl,
                    success: true
                });
            } catch (err) {
                // 下载失败，记录错误
                results.push({
                    url,
                    success: false,
                    error: err.message || '下载失败'
                });
            }
        }

        return {
            code: 0,
            msg: '批量处理完成',
            data: results
        };
    }
};