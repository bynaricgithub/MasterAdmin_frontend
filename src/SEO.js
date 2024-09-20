/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";

const SEO = ({ title, data }) => {

    const [SEOData, setSEOData] = useState({
        page_title: "",
        meta_content: "",
    });

    useEffect(() => {
        if (title) {
            setSEOData({ ...SEOData, page_title: title })
        }
        if (data) {
            setSEOData({ ...SEOData, meta_content: data })
        }
    }, [title, data]);


    return <>
        <Helmet>
            <title>
                {SEOData?.page_title}
            </title>
            <meta
                name="description"
                content={
                    SEOData?.meta_content ? SEOData?.meta_content : ''
                }
            />
            {/* <meta
                name="keywords"
                content={
                    SEOData?.keywords ? SEOData?.keywords : ''
                }
            /> */}
            {/* <link rel="canonical" href={pageUrl} /> */}
            <meta name="robots" content="index, follow" />

            <meta property="og:title" content={SEOData?.page_title} />
            <meta
                property="og:description"
                content={
                    SEOData?.meta_content ? SEOData?.meta_content : ''
                }
            />
            <meta property="og:image" content="/assets/images/logo.svg" />
            {/* <meta property="og:url" content={pageUrl} /> */}
        </Helmet>
    </>;
};

export default SEO;
