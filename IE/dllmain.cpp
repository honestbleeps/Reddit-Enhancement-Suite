// dllmain.cpp : Implementation of DllMain.

#include "stdafx.h"
#include "resource.h"
#include "BHO5_i.h"
#include "dllmain.h"
#include "compreg.h"

CBHO5Module _AtlModule;

class CBHO5App : public CWinApp
{
public:

// Overrides
	virtual BOOL InitInstance();
	virtual int ExitInstance();

	DECLARE_MESSAGE_MAP()
};

BEGIN_MESSAGE_MAP(CBHO5App, CWinApp)
END_MESSAGE_MAP()

CBHO5App theApp;

BOOL CBHO5App::InitInstance()
{
	return CWinApp::InitInstance();
}

int CBHO5App::ExitInstance()
{
	return CWinApp::ExitInstance();
}