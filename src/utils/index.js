import router from "@/router";
import axios from "axios";

const api = axios.create({
    baseURL: "https://api.example.com",
    headers: {
        "Content-Type": "application/json"
    }
});

// Thêm interceptor để tự động gắn token vào header
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token"); // Lấy token từ localStorage
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export function fileToBase64(file, includeMime = false) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("File không hợp lệ"));
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = reader.result;
            if (includeMime) {
                resolve(base64String); // Giữ nguyên cả MIME type
            } else {
                resolve(base64String.split(",")[1]); // Chỉ lấy phần base64
            }
        };
        reader.onerror = (error) => reject(error);
    });
}

export const updateQueryParams = (newParams) => {
    const currentRoute = router.currentRoute.value;
    const updatedQuery = { ...currentRoute.query, ...newParams };
    // Loại bỏ các param có giá trị null hoặc rỗng
    Object.keys(updatedQuery).forEach((key) => {
        if (updatedQuery[key] === null || updatedQuery[key] === "") {
            delete updatedQuery[key];
        }
    });
    // Thay đổi query params
    router.push({ path: currentRoute.path, query: updatedQuery });
    // router.replace({ path: currentRoute.path, query: updatedQuery });
};

export const playAudio = async (url_api, audioUrl, text, lang = "en") => {
    const playAudioFromUrl = (url) => {
        return new Promise((resolve, reject) => {
            const audio = new Audio(url);
            audio.play()
                .then(() => {
                    console.log("Audio is playing:", url);
                    resolve();
                })
                .catch((error) => {
                    console.error("Error playing audio:", error);
                    reject(error);
                });
            // Tùy chọn: Lắng nghe sự kiện kết thúc
            audio.onended = () => {
                console.log("Audio playback finished.");
            };
        });
    };
    try {
        if (audioUrl) {
            await playAudioFromUrl(audioUrl);
        } else {
            console.warn("Audio URL is missing, generating new audio...");
            const generatedUrl = await textToSpeech(url_api, text, lang);
            await playAudioFromUrl(generatedUrl);
        }
    } catch (error) {
        console.error("Retrying with generated audio...", error);
        const generatedUrl = await textToSpeech(url_api, text, lang);
        await playAudioFromUrl(generatedUrl);
    }
};

export async function textToSpeech(url_api, text, lang = "en") {
    try {
        const response = await fetch(`${url_api}/api/text-to-speech`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, lang }),
        });
        if (!response.ok) throw new Error("Failed to fetch audio");
        // Tạo URL từ Blob
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        // Phát âm thanh
        const audio = new Audio(audioUrl);
        audio.play();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export default api;