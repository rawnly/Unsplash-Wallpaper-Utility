const urls = () => Array.from(document.querySelectorAll("._1pn7R a._2Mc8_"));
const targets = () => Array.from(document.querySelectorAll("._1pn7R .yVU8k"));
const photos = () => Array.from(document.querySelectorAll("._1pn7R img._2zEKz"));
const overlayGroups = () => Array.from(document.querySelectorAll("._1pn7R ._12slh"));

let visible = false;
let position = "left";
let selected_photo = null;
let fastMode = false;
const sizes = [
	{
		label: "iPhone X/Xs",
		w: 375, //x,xs
		h: 812,
	},
	{
		label: "iPhone XR/Xs Max",
		w: 414, //xr - xsmax
		h: 896,
	},
	{
		label: "iPhone Plus",
		w: 414, // all +
		h: 736,
	},
	{
		label: "iPhone Standard",
		w: 375, // 6,6s,7,8
		h: 667,
	},
	{
		label: "iPhone 5/SE",
		w: 320, // 5 series / SE
		h: 568,
	},
];

let defaultSize = 0;

const collectionsList = [
	{
		id: "3644553",
		label: "StockPapers",
	},
	{
		id: "3814482",
		label: "Skylines",
	},
	{
		id: "3814634",
		label: "Portrait Cars",
	},
];

const getFrameIcon = () => (position === "left" ? "&#8614;" : "&#8612;");
const getStatus = () => (!!visible ? "Hide" : "Show");
const createButton = (text = "Click ME!") => {
	const li = document.createElement("li");
	li.innerHTML = text;
	return li;
};

const hideFrame = (frame) => {
	frame.remove();
	visible = false;
	ToggleButton.innerHTML = getStatus();

	Array.from(document.querySelectorAll(".unsplash_utility__pinButton")).forEach((el) =>
		el.classList.remove("selected"),
	);
};

const showFrame = (frame) => {
	document.body.append(frame);
	visible = true;
	ToggleButton.innerHTML = getStatus();
};

const toggleVisibility = (frame) => {
	if (visible) return hideFrame(frame);
	showFrame(frame);
};

const setSize = (frame, index) => {
	const size = sizes[index];

	frame.style.width = `calc(${size.w}pt / 1.5)`;
	frame.style.height = `calc(${size.h}pt / 1.5)`;
};

const createFrame = () => {
	let frame = document.createElement("div");

	frame.setAttribute("id", "unsplash_utility__frame");
	frame.setAttribute("class", `${position}`);

	setSize(frame, defaultSize);

	const swapSide = () => {
		frame.classList.toggle("left");
		frame.classList.toggle("right");

		position = frame.classList.contains("right") ? "right" : "left";
	};

	const topbar = document.createElement("div");
	topbar.setAttribute("class", "topbar hidden");

	const title = document.createElement("select");
	title.setAttribute("id", "photo_id");
	title.innerHTML = sizes[defaultSize].label;
	sizes.map((item, index) => {
		const o = document.createElement("option");

		o.setAttribute("value", index);
		o.innerHTML = `${item.label}`;

		title.append(o);
	});

	title.addEventListener("change", () => setSize(frame, title.value));

	const close = document.createElement("a");
	close.setAttribute("class", "close");
	close.innerHTML = "&times;";
	close.addEventListener("click", () => hideFrame(frame));

	const arrow = document.createElement("a");
	arrow.setAttribute("class", "switch");
	arrow.innerHTML = getFrameIcon();
	arrow.addEventListener("click", () => {
		swapSide();
		arrow.innerHTML = getFrameIcon();
	});

	topbar.append(title);
	topbar.append(close);
	topbar.append(arrow);

	const collections = document.createElement("div");
	collections.setAttribute("class", "collections hidden");

	collectionsList.map(({ id, label }) => {
		const collection = document.createElement("div");
		collection.setAttribute("class", "collection");
		collection.innerHTML = label;
		collection.addEventListener("click", () => {
			if (!!selected_photo === false) return;
			if (!confirm(`Add this photo to ${label}?`)) return;

			fetch(`/napi/collections/${id}/add`, {
				method: "POST",
				body: JSON.stringify({ photo_id: selected_photo }),
				headers: {
					"Content-Type": "application/json",
				},
			})
				.then((response) => response.json())
				.then((data) => {
					alert("Added!");
				})
				.catch((error) => {
					alert("Error!");
					console.error(error);
				});
		});

		collections.append(collection);
	});

	const container = document.createElement("div");
	container.setAttribute("class", "container");

	const statusText = document.createElement("h4");
	statusText.innerHTML = "Select a photo";
	statusText.style.color = "white";
	container.append(statusText);

	frame.append(topbar);
	frame.append(collections);
	frame.append(container);

	return frame;
};

const addListeners = () => {
	for (let i = 0; i < photos().length; i++) {
		const photo = {
			img: photos()[i],
			id: urls()
				[i].getAttribute("href")
				.match(/([A-z\_\-0-9]+)/g)[1],
			target: targets()[i],
			overlay: overlayGroups()[i],
		};

		selected_photo = photo.id;

		function onHover() {
			if (visible) {
				frame.style.backgroundImage = `url(${photo.img.getAttribute("src")})`;
				photo.isSelected = true;
			}
		}

		if (photo.target.getAttribute("pin-added") === "false" || !photo.target.getAttribute("pin-added")) {
			const pinButton = document.createElement("a");
			pinButton.setAttribute(
				"class",
				"_1QwHQ _1l4Hh _1CBrG _1zIyn xLon9 _1Tfeo _2L6Ut _2Xklx unsplash_utility__pinButton",
			);

			// pinButton.append(icon);
			pinButton.innerHTML = `<span>
			<svg class="Apljk _11dQc"  width="32" height="32" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
				<path d="M464 144H128c-17.6 0-32 14.4-32 32v240c0 17.6 14.4 32 32 32h336c17.6 0 32-14.4 32-32V176c0-17.6-14.4-32-32-32z"/>
				<path d="M100 116h332V96c0-17.6-14.4-32-32-32H48c-17.6 0-32 14.4-32 32v256c0 17.6 14.4 32 32 32h20V148c0-17.6 14.4-32 32-32z"/>
			</svg>
		</span>`;

			pinButton.addEventListener("click", () => {
				if (pinButton.classList.contains("selected")) return;
				if (!visible) toggleVisibility(frame);
				onHover();

				Array.from(document.querySelectorAll(".unsplash_utility__pinButton")).forEach((el) => {
					if (el.classList) {
						el.classList.remove("selected");
					}
				});

				pinButton.classList.add("selected");

				const title = document.querySelector(".container h4");
				if (title) title.remove();
			});

			photo.overlay.style.display = "flex";
			photo.overlay.style.flexWrap = "nowrap";
			photo.overlay.style.display = "flex";

			photo.overlay.append(pinButton);

			photo.target.setAttribute("pin-added", true);
		}

		if (fastMode) {
			photo.target.removeEventListener("mouseenter", onHover);
			photo.target.addEventListener("mouseenter", onHover);
		}
	}
};

// start creating stuff
const frame = createFrame();
const ToggleButton = createButton(getStatus());
const box = document.createElement("ul");
box.setAttribute("id", "unsplash_utility__toolbox");

ToggleButton.addEventListener("click", () => {
	if (visible) {
		frame.remove();
	} else {
		document.body.append(frame);
	}

	visible = !visible;
	ToggleButton.innerHTML = getStatus();
});

box.append(ToggleButton);
// document.body.append(box);

if (visible) showFrame(frame);

addListeners();
window.addEventListener("scroll", addListeners);
