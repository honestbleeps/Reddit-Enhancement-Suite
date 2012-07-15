// RESBHO.cpp : Implementation of CRESBHO

#include "stdafx.h"
#include "RESBHO.h"

/**
** Whether prefix is a prefix of data
**/
bool CRESBHO::prefixMatch(CComBSTR prefix, CComBSTR data)
{
	for (int i = 0; i < data.Length() && i < prefix.Length(); i++)
	{
		if (prefix[i] != data[i])
		{
			return false;
		}
	}
	
	return true;
}

void STDMETHODCALLTYPE CRESBHO::OnNavigateComplete(IDispatch *pDisp, VARIANT *pvarURL)
{
    HRESULT hr = S_OK;

    CComQIPtr<IWebBrowser2> spTempWebBrowser = pDisp;
	//Activate only on this domain
	CComBSTR dest = "http://www.reddit.com/";

	CComBSTR url = pvarURL->bstrVal;
	
	if (prefixMatch(dest, url))
	{
		if (spTempWebBrowser && m_spWebBrowser &&
			m_spWebBrowser.IsEqualObject(spTempWebBrowser))
		{
			CComPtr<IDispatch> spDispDoc;
			hr = m_spWebBrowser->get_Document(&spDispDoc);
			if (SUCCEEDED(hr))
			{
				CComQIPtr<IHTMLDocument2> spHTMLDoc = spDispDoc;
				if (spHTMLDoc != NULL)
				{
					modDOM(spHTMLDoc);
				}
        }
    }
	}
}

void CRESBHO::modDOM(IHTMLDocument2 *pDocument)
{
	CComPtr<IHTMLElement> script;
	CComBSTR addition = "script";
	pDocument->createElement(addition, &script);


	CComPtr<IHTMLElementCollection> all;
	pDocument->get_all(&all);


	CComPtr<IDispatch> target;

	CComVariant headLabel(L"head");

	all->tags(headLabel, &target);
	CComQIPtr<IHTMLElementCollection> heads = target;

	CComQIPtr<IDispatch> fin;
	CComVariant start(0);
	CComVariant empty;
	heads->item(start, empty, &fin);
	CComBSTR typeName = "type";
	CComVariant typeVal(L"text/javascript");
	script->setAttribute(typeName, typeVal);
	CComBSTR srcName = "src";
	//TODO change this address to the server where the library is hosted
	CComVariant srcVal(L"http://127.0.0.1/reddit_enhancement_suite.user.js");	
	script->setAttribute(srcName, srcVal);
	
	CComQIPtr<IHTMLDOMNode> scriptDOM = script;
	CComQIPtr<IHTMLDOMNode> headDOM = fin;
	CComPtr<IHTMLDOMNode> moddedDOM;
	headDOM->appendChild(scriptDOM, &moddedDOM);
	headDOM = moddedDOM;

	pDocument->close();
}

STDMETHODIMP CRESBHO::SetSite(IUnknown* pUnkSite)
{
    if (pUnkSite != NULL)
    {
        // Cache the pointer to IWebBrowser2, to check which document has been completed
        HRESULT hr = pUnkSite->QueryInterface(IID_IWebBrowser2, (void **)&m_spWebBrowser);
        if (SUCCEEDED(hr))
        {
            // Register to sink events from DWebBrowserEvents2.
			hr = DispEventAdvise(m_spWebBrowser);
            if (SUCCEEDED(hr))
            {
                m_fAdvised = TRUE;
            }
        }
    }
    else
    {
        // Unregister event sink.
        if (m_fAdvised)
        {
            DispEventUnadvise(m_spWebBrowser);
            m_fAdvised = FALSE;
        }

        // Release cached pointers and other resources here, at uninitialization
        m_spWebBrowser.Release();
    }

    // Call base class implementation.
    return IObjectWithSiteImpl<CRESBHO>::SetSite(pUnkSite);
	
}

