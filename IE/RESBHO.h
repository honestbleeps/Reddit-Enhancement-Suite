// RESBHO.h : Declaration of the CRESBHO

#pragma once
#include "resource.h"       // main symbols
#include <mshtml.h>


#include "BHO5_i.h"
#include <shlguid.h>
#include <exdispid.h>
#include <atlsafe.h>


#if defined(_WIN32_WCE) && !defined(_CE_DCOM) && !defined(_CE_ALLOW_SINGLE_THREADED_OBJECTS_IN_MTA)
#error "Single-threaded COM objects are not properly supported on Windows CE platform, such as the Windows Mobile platforms that do not include full DCOM support. Define _CE_ALLOW_SINGLE_THREADED_OBJECTS_IN_MTA to force ATL to support creating single-thread COM object's and allow use of it's single-threaded COM object implementations. The threading model in your rgs file was set to 'Free' as that is the only threading model supported in non DCOM Windows CE platforms."
#endif

using namespace ATL;


// CRESBHO

class ATL_NO_VTABLE CRESBHO :
	public CComObjectRootEx<CComSingleThreadModel>,
	public CComCoClass<CRESBHO, &CLSID_RESBHO>,
	public IObjectWithSiteImpl<CRESBHO>,
	public IDispatchImpl<IRESBHO, &IID_IRESBHO, &LIBID_BHO5Lib, /*wMajor =*/ 1, /*wMinor =*/ 0>,
	public IDispEventImpl<1, CRESBHO, &DIID_DWebBrowserEvents2, &LIBID_SHDocVw, 1, 1>
{
public:
	CRESBHO()
	{
	}

DECLARE_REGISTRY_RESOURCEID(IDR_HELLOWORLDBHO)

DECLARE_NOT_AGGREGATABLE(CRESBHO)

BEGIN_COM_MAP(CRESBHO)
	COM_INTERFACE_ENTRY(IRESBHO)
	COM_INTERFACE_ENTRY(IDispatch)
	COM_INTERFACE_ENTRY(IObjectWithSite)
END_COM_MAP()

	BEGIN_SINK_MAP(CRESBHO)
		SINK_ENTRY_EX(1, DIID_DWebBrowserEvents2, DISPID_DOCUMENTCOMPLETE, OnNavigateComplete)
	END_SINK_MAP()

    // DWebBrowserEvents2
    void STDMETHODCALLTYPE OnNavigateComplete(IDispatch *pDisp, VARIANT *pvarURL); 

	DECLARE_PROTECT_FINAL_CONSTRUCT()

	HRESULT FinalConstruct()
	{
		return S_OK;
	}

	void FinalRelease()
	{
	}

public:
	STDMETHOD(SetSite)(IUnknown *pUnkSite);

private:
	bool prefixMatch(CComBSTR prefix, CComBSTR data);
	void modDOM(IHTMLDocument2 *pDocument);
	CComPtr<IWebBrowser2>  m_spWebBrowser;
	BOOL m_fAdvised;
};

OBJECT_ENTRY_AUTO(__uuidof(RESBHO), CRESBHO)
