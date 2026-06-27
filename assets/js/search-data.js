// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-publications",
          title: "publications",
          description: "Selected publications and preprints.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "Selected research and development projects.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-cv",
          title: "CV",
          description: "A concise academic CV focused on research, publications, honors, and service.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "news-i-received-the-national-scholarship-for-the-second-time",
          title: 'I received the National Scholarship for the second time.',
          description: "",
          section: "News",},{id: "news-i-began-a-remote-research-internship-with-the-computational-design-and-fabrication-group-at-mit-csail",
          title: 'I began a remote research internship with the Computational Design and Fabrication Group...',
          description: "",
          section: "News",},{id: "news-two-papers-i-contributed-to-will-appear-at-cvpr-2026-wildcap-as-a-poster-and-m3dlayout-as-a-highlight",
          title: 'Two papers I contributed to will appear at CVPR 2026: WildCap as a...',
          description: "",
          section: "News",},{id: "news-our-work-on-learning-a-delighting-prior-for-facial-appearance-capture-was-accepted-to-siggraph-2026",
          title: 'Our work on learning a delighting prior for facial appearance capture was accepted...',
          description: "",
          section: "News",},{id: "news-i-started-a-research-internship-at-uiuc-working-with-prof-shuang-zhao-on-differentiable-rendering",
          title: 'I started a research internship at UIUC, working with Prof. Shuang Zhao on...',
          description: "",
          section: "News",},{id: "projects-3d-scene-generation-and-layout-understanding",
          title: '3D Scene Generation and Layout Understanding',
          description: "Structured data and representations for 3D indoor scene generation.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/3d-scene-generation/";
            },},{id: "projects-echo-of-time",
          title: 'Echo of Time',
          description: "A three-player cross-time cooperative puzzle game built with Unity.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/echo-of-time/";
            },},{id: "projects-facial-appearance-capture-in-the-wild",
          title: 'Facial Appearance Capture in the Wild',
          description: "Inverse rendering methods for robust facial albedo and appearance capture.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/facial-appearance-capture/";
            },},{id: "projects-flowpde",
          title: 'FlowPDE',
          description: "Understanding and justifying flow matching for neural PDE solving.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/flowpde/";
            },},{
        id: 'social-cv',
        title: 'CV',
        section: 'Socials',
        handler: () => {
          window.open("/assets/pdf/Tianxiao_Li_CV.pdf", "_blank");
        },
      },{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%74%78-%6C%69%32%33@%6D%61%69%6C%73.%74%73%69%6E%67%68%75%61.%65%64%75.%63%6E", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/tingyunaiai9", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/feed.xml", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
