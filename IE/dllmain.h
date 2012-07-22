// dllmain.h : Declaration of module class.

class CBHO5Module : public ATL::CAtlDllModuleT< CBHO5Module >
{
public :
	DECLARE_LIBID(LIBID_BHO5Lib)
	DECLARE_REGISTRY_APPID_RESOURCEID(IDR_BHO5, "{F2E6CC09-4DCF-4B51-A67A-943EBA88830E}")
};

extern class CBHO5Module _AtlModule;
