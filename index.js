import Home from "./pages/Home.js";
import Room from "./pages/Room.js";

const getIsMatch = (path) =>{
    const locationPath = location.pathname.split('/');
    for (let i = 0; i < path.length; i++) {
        if (path[i] !== locationPath[i]) {
            return false;
        }
    }
    return true;
}

const router = async () => {
    const routes = [
        { path: ["", ""], view: Home },
        { path: ["", "room"], view: Room }
    ];

    const pageMatches = routes.map((route) => {
        return {
            route,
            isMatch: getIsMatch(route.path),
        };
    });
    let match = pageMatches.find((pageMatch) => pageMatch.isMatch);

    if (!match) {
        match = {
            route: location.pathname,
            isMatch: true,
        };
        const page = new NotFound();
        document.querySelector("#root").innerHTML = await page.getHtml();
    } else {
        const page = new match.route.view();
        document.querySelector("#root").innerHTML = await page.getHtml();
        page.init();
    }
};

// 뒤로 가기 할 때 데이터 나오게 하기 위함
window.addEventListener("popstate", () => {
    router();
});

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (e) => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            history.pushState(null, null, e.target.href);
            router();
        }
    });
    router();
});